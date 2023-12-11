import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';
import { roles } from 'src/modules/auth/roles';
import { SendNotificationDto } from './send-notification.dto';

export class SendRoleNotificationDto extends SendNotificationDto {
    @ApiProperty({
        description: 'Roles of users to send notification to',
        type: 'array',
        items: {
            type: 'string',
        },
        enum: Object.values(roles),
    })
    @IsNotEmpty()
    @IsArray()
    roles: string[];
}
