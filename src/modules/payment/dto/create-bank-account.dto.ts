import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { RecordIsInDb } from 'src/common/decorators/record_is_in_db.decorator';

export class CreateBankAccountDto {
    @ApiProperty({
        description: 'The account number of the user',
        example: '0012345689',
    })
    @IsNotEmpty()
    @IsString()
    account_number: string;

    @ApiProperty({
        description: 'The account name of the user',
        example: 'John Doe',
    })
    @IsNotEmpty()
    @IsString()
    account_name: string;

    @ApiProperty({
        description: 'user id',
        example: '121222',
    })
    @IsNotEmpty()
    user_id: number;

    @ApiProperty({
        description: 'user id',
        example: '121222',
    })
    @IsNotEmpty()
    @RecordIsInDb('bank.id')
    bank_id: number;
}
