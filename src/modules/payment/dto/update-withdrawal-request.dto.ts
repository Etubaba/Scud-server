import { WithdrawalStatus } from '@prisma/client';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export default class UpdateWithdrawalRequestDto {
    @IsString()
    @IsNotEmpty()
    @IsIn(Object.values(WithdrawalStatus))
    status: WithdrawalStatus;
}
