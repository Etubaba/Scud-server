import { Type } from 'class-transformer';
import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    Min,
    ValidateNested,
} from 'class-validator';
import { IsLess } from 'src/common/decorators/isless.decorator';
import { OneIsNeeded } from 'src/common/decorators/one_is_needed.decorator';
export class MailField {
    @IsString()
    @IsNotEmpty()
    subject: string;

    @IsString()
    @IsOptional()
    @OneIsNeeded('body')
    template: string;

    @IsString()
    @IsOptional()
    body: string;
}
export class UpdateOweNotification {
    @ValidateNested()
    @Type(() => MailField)
    @IsNotEmpty()
    first: MailField;

    @ValidateNested()
    @Type(() => MailField)
    @IsNotEmpty()
    second: MailField;

    @ValidateNested({})
    @Type(() => MailField)
    @IsNotEmpty()
    third: MailField;

    @IsNotEmpty()
    @IsNumber()
    max_owe_amount: number;

    @IsNotEmpty()
    @IsNumber()
    @IsLess('max_owe_amount')
    min_owe_amount: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Max(99)
    percentage: number;
}
