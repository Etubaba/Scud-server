import { ApiProperty } from '@nestjs/swagger';
import { Channel } from '@prisma/client';
import { IsArray, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { SendNotificationDto } from './send-notification.dto';

export class SendPartialNotificationDto extends SendNotificationDto {
    @ApiProperty({
        description: 'Emails of every user to send to',
        type: 'array',
        items: {
            type: 'string',
        },
    })
    @ValidateIf((o) => o.channel === Channel.mail)
    @IsNotEmpty()
    @IsArray()
    emails: string[];

    @ApiProperty({
        description: 'Phone numbers of every user to send to',
        type: 'array',
        items: {
            type: 'string',
        },
    })
    @ValidateIf((o) => o.channel === Channel.sms)
    @IsNotEmpty()
    @IsArray()
    phone_numbers: string[];
}
