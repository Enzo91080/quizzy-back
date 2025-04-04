import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { QuizzService } from './quizz.service';

/**
 * Passerelle WebSocket pour gérer les événements temps réel liés aux quiz
 */
@WebSocketGateway({ cors: true })
export class QuizGateway implements OnGatewayConnection {
    @WebSocketServer()
    server: Server;

    private hostSockets = new Map<string, Socket>(); // executionId -> host socket
    private currentQuestionIndex = new Map<string, number>(); // executionId -> index
    private quizStatus = new Map<string, 'waiting' | 'started'>(); // executionId -> current status

    constructor(private readonly quizzService: QuizzService) { }

    /**
     * Gestion de la connexion d'un client WebSocket
     */
    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    /**
     * Calcule le nombre de participants (exclut l'hôte)
     */
    private getParticipantCount(executionId: string): number {
        const room = `execution_${executionId}`;
        const roomSockets = this.server.sockets.adapter.rooms.get(room) || new Set();
        const hostSocket = this.hostSockets.get(executionId);
        return Array.from(roomSockets).filter(socketId => socketId !== hostSocket?.id).length;
    }

    /**
     * Lorsqu’un hôte rejoint une exécution avec son executionId
     * - Le socket est stocké comme hôte
     * - Il rejoint la room liée à l'exécution
     * - On émet les détails du quiz à l'hôte
     * - On notifie tous les clients de l'état "waiting"
     */
    @SubscribeMessage('host')
    async handleHost(
        @MessageBody() payload: { executionId: string },
        @ConnectedSocket() client: Socket,
    ) {
        const { executionId } = payload;

        try {
            const executionSnap = await this.quizzService.getExecutionById(executionId);
            if (!executionSnap.exists) {
                client.emit('error', { message: 'Execution not found' });
                return;
            }

            const executionData = executionSnap.data();
            const quizSnap = await this.quizzService.getQuizById(executionData.quizId);
            if (!quizSnap.exists) {
                client.emit('error', { message: 'Quiz not found' });
                return;
            }

            const quizData = quizSnap.data();
            const room = `execution_${executionId}`;

            this.hostSockets.set(executionId, client);
            this.quizStatus.set(executionId, 'waiting');
            client.join(room);

            client.emit('hostDetails', {
                quiz: {
                    title: quizData.title,
                },
            });

            const participantCount = this.getParticipantCount(executionId);
            this.server.to(room).emit('status', {
                status: 'waiting',
                participants: participantCount,
            });
        } catch (error) {
            console.error('Erreur dans handleHost:', error);
            client.emit('error', { message: 'Erreur interne' });
        }
    }

    /**
     * Lorsqu’un participant rejoint une exécution
     * - Le client rejoint la room
     * - On lui envoie les détails du quiz
     * - On notifie tous les clients du statut actuel (waiting ou started)
     */
    @SubscribeMessage('join')
    async handleJoin(
        @MessageBody() payload: { executionId: string },
        @ConnectedSocket() client: Socket,
    ) {
        const { executionId } = payload;

        try {
            const executionSnap = await this.quizzService.getExecutionById(executionId);
            if (!executionSnap.exists) {
                client.emit('error', { message: 'Execution not found' });
                return;
            }

            const executionData = executionSnap.data();
            const quizSnap = await this.quizzService.getQuizById(executionData.quizId);
            if (!quizSnap.exists) {
                client.emit('error', { message: 'Quiz not found' });
                return;
            }

            const quizData = quizSnap.data();
            const room = `execution_${executionId}`;

            client.join(room);

            client.emit('joinDetails', {
                quizTitle: quizData.title,
            });

            const participantCount = this.getParticipantCount(executionId);
            const status = this.quizStatus.get(executionId) ?? 'waiting';

            this.server.to(room).emit('status', {
                status,
                participants: participantCount,
            });
        } catch (error) {
            console.error('Erreur dans handleJoin:', error);
            client.emit('error', { message: 'Erreur interne' });
        }
    }

    /**
     * Lorsqu’un hôte envoie "nextQuestion"
     * - L’index de la question actuelle est avancé
     * - La question suivante est envoyée à tous les clients
     * - Le statut passe à "started"
     */
    @SubscribeMessage('nextQuestion')
    async handleNextQuestion(
        @MessageBody() payload: { executionId: string },
        @ConnectedSocket() client: Socket,
    ) {
        const { executionId } = payload;

        try {
            const executionSnap = await this.quizzService.getExecutionById(executionId);
            if (!executionSnap.exists) {
                client.emit('error', { message: 'Execution not found' });
                return;
            }

            const executionData = executionSnap.data();
            const quizSnap = await this.quizzService.getQuizById(executionData.quizId);
            if (!quizSnap.exists) {
                client.emit('error', { message: 'Quiz not found' });
                return;
            }

            const quizData = quizSnap.data();
            const room = `execution_${executionId}`;

            const currentIndex = this.currentQuestionIndex.get(executionId) ?? 0;
            const question = quizData.questions?.[currentIndex];

            if (!question) {
                client.emit('error', { message: 'No more questions' });
                return;
            }

            this.currentQuestionIndex.set(executionId, currentIndex + 1);
            this.quizStatus.set(executionId, 'started');

            const participantCount = this.getParticipantCount(executionId);
            this.server.to(room).emit('status', {
                status: 'started',
                participants: participantCount,
            });

            this.server.to(room).emit('newQuestion', {
                question: question.title,
                answers: question.answers.map((a: any) => a.title),
            });
        } catch (error) {
            console.error('Erreur dans handleNextQuestion:', error);
            client.emit('error', { message: 'Erreur interne' });
        }
    }
}
