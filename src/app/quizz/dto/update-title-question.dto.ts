import { ApiProperty } from '@nestjs/swagger';

export class UpdateTitleQuestionDto {
    @ApiProperty({ example: 'replace', description: "Opération JSON Patch ('replace' attendu)" })
    op: string;

    @ApiProperty({ example: '/title', description: 'Chemin de la propriété à modifier' })
    path: string;

    @ApiProperty({ example: 'Nouveau titre', description: 'Nouvelle valeur du titre' })
    value: string;
}
