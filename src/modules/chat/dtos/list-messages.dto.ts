import { IsNotEmpty, IsNumber } from 'class-validator';
import { RecordIsInDb } from 'src/common/decorators/record_is_in_db.decorator';

export class ListMessagesDto {
    @IsNotEmpty()
    @IsNumber()
    @RecordIsInDb('user.id')
    recipient_id: number;
}
