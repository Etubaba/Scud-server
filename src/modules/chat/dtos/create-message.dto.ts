import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';
import { RecordIsInDb } from 'src/common/decorators/record_is_in_db.decorator';

export class CreateMessageDto {
    @IsNotEmpty()
    @IsNumber()
    @RecordIsInDb('user.id')
    recipient_id: number;

    @IsNotEmpty()
    @IsString()
    content: string;
}
