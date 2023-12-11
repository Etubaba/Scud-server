import { IsNotEmpty, IsNumber } from 'class-validator';

export default class CreateWithdrawalRequestDto {
    @IsNumber()
    @IsNotEmpty()
    amount: number;
}
