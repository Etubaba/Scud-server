import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber } from 'class-validator';
import { RecordIsInDb } from 'src/common/decorators/record_is_in_db.decorator';

export class ReadMessagesDto {
    @IsArray()
    @ArrayNotEmpty()
    message_ids: number[];

    @IsNotEmpty()
    @IsNumber()
    @RecordIsInDb('user.id')
    recipient_id: number;
}
