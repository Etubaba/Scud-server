import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyTransactionDto {
    @ApiProperty({
        description: 'Reference No',
        example: 'PAYSTACK-REF-1678612771478',
    })
    @IsNotEmpty()
    @IsString()
    reference: string;
}
