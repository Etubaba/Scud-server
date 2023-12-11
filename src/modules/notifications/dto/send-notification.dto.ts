import { ApiProperty } from '@nestjs/swagger';
import { Channel } from '@prisma/client';
import {
    IsDateString,
    IsIn,
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator';
import * as moment from 'moment';
import { MinDate } from 'src/common/decorators/custom-min-date.decorator';

const date = moment().add(1, 'hour');

export class SendNotificationDto {
    @ApiProperty({
        description: 'The subject of the notification',
        example: 'Greetings from scud',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    subject: string;

    @ApiProperty({
        description: 'The Body of the notification',
        example: 'You Should Be Using Scud Today',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    body: string;

    @ApiProperty({
        description: 'Channel used to send the message',
        example: 'Mail',
    })
    @IsNotEmpty()
    @IsIn(Object.values(Channel))
    channel: Channel;

    @ApiProperty({
        description: 'Time the message is scheduled for',
        example: '2023-01-01T00:00:00.123Z',
        type: String,
    })
    @IsOptional()
    @IsDateString()
    @MinDate(date.toDate(), {
        message: `minimal allowed date for scheduling is ${date.fromNow()} from now`,
    })
    schedule: string;
}
