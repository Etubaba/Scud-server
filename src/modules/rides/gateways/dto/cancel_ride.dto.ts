import { IsNotEmpty, IsString } from 'class-validator';

export class CancelRideDto {
    @IsNotEmpty()
    @IsString()
    cancel_reason: string;
}
