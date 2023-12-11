import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class BalanceTransferDto {
    @ApiProperty({
        description: 'User id',
        example: 12121,
    })
    @IsNotEmpty()
    @IsNumber()
    user_id: number;

    @ApiProperty({
        description: 'Reason',
        example: '',
    })
    @IsNotEmpty()
    @IsString()
    reason: string;

    @ApiProperty({
        description: 'Amount',
        example: 1000,
    })
    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @ApiProperty({
        description: 'Payment gateway to use',
        example: 'paystack',
    })
    @IsNotEmpty()
    @IsString()
    gateway: string;
}
