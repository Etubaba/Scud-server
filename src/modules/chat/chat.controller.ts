import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { ChatService } from './chat.service';
import { ListMessagesDto } from './dtos/list-messages.dto';

@Controller('chats')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Get('chatlist')
    @HttpCode(HttpStatus.OK)
    getChatList(@AuthUser() user: User) {
        return this.chatService.chatList(user.id);
    }

    @Get('conversation/:id')
    @HttpCode(HttpStatus.OK)
    getConversation(@AuthUser() user: User, @Param('id') recipient_id: string) {
        return this.chatService.list(user.id, +recipient_id);
    }
}
