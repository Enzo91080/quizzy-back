// --- update-title-question.dto.ts ---
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTitleQuestionDto {
    @ApiProperty({ example: 'replace' })
    op: string;

    @ApiProperty({ example: '/title' })
    path: string;

    @ApiProperty({ example: 'Nouveau titre' })
    value: string;
}