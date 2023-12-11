import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTransactionDto {
    @ApiProperty({})
    @IsNotEmpty()
    @IsNumber()
    trip_id: number;
}
