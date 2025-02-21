export class FindQuizzDto {
  id: string;
  title: string;
  description?: string;
  userId?: string;
  questions?: {
    title: string;
    answers: { title: string; isCorrect: boolean }[];
  }[]; // Assurez-vous que la structure des questions est correcte
  _links?: {
    create: string;
    start?: string; // 👈 Start est optionnel
  };
}
