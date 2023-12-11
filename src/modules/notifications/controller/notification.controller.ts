import {
    Body,
    Controller,
    Delete,
    Get,
    Req,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Query,
} from '@nestjs/common';
import { SendNotificationDto } from '../dto/send-notification.dto';
import { NotificationService } from '../services/notification.service';
import { Permissions } from 'src/modules/auth/decorators/permission.decorator';
import { SendRoleNotificationDto } from '../dto/send-roles-notification.dto';
import { SendPartialNotificationDto } from '../dto/send-partail-notification.dto';
import { ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';

@Controller('notifications')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Post('all-users')
    @Permissions('create-notifications')
    @HttpCode(HttpStatus.CREATED)
    sendToAll(@Body() sendDto: SendNotificationDto) {
        return this.notificationService.sendToAllUsers(sendDto);
    }

    @Post('specific-users')
    @Permissions('create-notifications')
    @HttpCode(HttpStatus.CREATED)
    sendToSome(@Body() sendPartialDto: SendPartialNotificationDto) {
        return this.notificationService.sendToSpecificUsers(sendPartialDto);
    }

    @Post('roles')
    @Permissions('create-notifications')
    @HttpCode(HttpStatus.CREATED)
    sendToRoles(@Body() sendRoleDto: SendRoleNotificationDto) {
        return this.notificationService.sendToUsersWithRole(sendRoleDto);
    }

    @Post('inactive-users')
    @Permissions('create-notifications')
    @HttpCode(HttpStatus.CREATED)
    sendToInactive(@Body() sendDto: SendNotificationDto) {
        return this.notificationService.sendToInactiveUsers(sendDto);
    }

    @Post('inactive-roles')
    @Permissions('create-notifications')
    @HttpCode(HttpStatus.CREATED)
    sendToInactiveUserWithRoles(@Body() sendRoleDto: SendRoleNotificationDto) {
        return this.notificationService.sendToInactiveUsersWithRoles(
            sendRoleDto,
        );
    }

    @Get()
    @Permissions('browse-notifications')
    @ApiQuery({
        name: 'next_cursor',
    })
    @ApiQuery({
        name: 'sort',
    })
    @ApiQuery({
        name: 'direction',
    })
    @ApiQuery({
        name: 'filter',
    })
    list(@Query() query, @Req() request: Request) {
        return this.notificationService.list(query, request);
    }

    @Get(':id')
    @Permissions('read-notifications')
    @HttpCode(HttpStatus.OK)
    find(@Param('id') id: string) {
        return this.notificationService.find(+id);
    }

    @Delete(':id')
    @Permissions('delete-notifications')
    @HttpCode(HttpStatus.OK)
    remove(@Param('id') id: string) {
        return this.notificationService.delete(+id);
    }
}
