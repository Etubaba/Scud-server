import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Namespace } from 'socket.io';
import { ChatMessage } from 'src/common/types/socketChatUser.type';
import { SocketWithAuth } from 'src/common/types/socketWithAuth.type';
import { BadRequestTransformationFilter } from 'src/modules/socket/exceptions/ws-catch-all.filter';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dtos/create-message.dto';
import { ListMessagesDto } from './dtos/list-messages.dto';
import { ReadMessagesDto } from './dtos/read-messages.dto';

@UseFilters(new BadRequestTransformationFilter())
@UsePipes(new ValidationPipe())
@WebSocketGateway({
    namespace: 'chats',
    cors: {
        origin: '*',
        allowedHeaders: '*',
        methods: '*',
    },
})
export class ChatGateway
    implements OnGatewayInit, OnGatewayDisconnect, OnGatewayConnection
{
    constructor(private readonly chatService: ChatService) {}

    @WebSocketServer()
    io: Namespace;
    afterInit(server: any) {}

    handleDisconnect(client: SocketWithAuth) {
        return this.chatService.disconnect(client);
    }

    async handleConnection(client: SocketWithAuth) {
        return this.chatService.connect(client);
    }

    @SubscribeMessage('sendMessage')
    async handleSendMessage(
        @MessageBody() data: CreateMessageDto,
        @ConnectedSocket() client: SocketWithAuth,
    ) {
        const message: ChatMessage = {
            recipient_id: data.recipient_id,
            content: data.content,
        };

        const result = await this.chatService.create(message, client.user.id);
        const conversation = await this.chatService.list(
            client.user.id,
            data.recipient_id,
        );

        if (result.recipient) {
            const recipient_chatlist = await this.chatService.chatList(
                result.recipient.id,
            );
            this.io
                .to(result.recipient.socket_id)
                .emit('newMessage', result.message);
            this.io
                .to(result.recipient.socket_id)
                .emit('chatList', recipient_chatlist);
            this.io
                .to(result.recipient.socket_id)
                .emit('conversation', conversation);
        }

        const chatList = await this.chatService.chatList(client.user.id);
        this.io.to(client.id).emit('chatList', chatList);
        this.io.to(client.id).emit('conversation', conversation);

        return { event: 'sendMessage', data: result.message };
    }

    @SubscribeMessage('chatList')
    async handleChatList(@ConnectedSocket() client: SocketWithAuth) {
        const chatList = await this.chatService.chatList(client.user.id);
        return { event: 'chatList', data: chatList };
    }

    @SubscribeMessage('conversation')
    async handleChatMessages(
        @MessageBody() data: ListMessagesDto,
        @ConnectedSocket() client: SocketWithAuth,
    ) {
        const messages = await this.chatService.list(
            client.user.id,
            data.recipient_id,
        );
        return { event: 'conversation', data: messages };
    }

    @SubscribeMessage('readMessages')
    async handleReadMessages(
        @MessageBody() data: ReadMessagesDto,
        @ConnectedSocket() client: SocketWithAuth,
    ) {
        const recipient = await this.chatService.getRecipient(
            data.recipient_id,
        );
        const result = await this.chatService.readMessages(
            data.message_ids,
            client.user.id,
        );
        if (recipient) {
            const conversation = await this.chatService.list(
                client.user.id,
                data.recipient_id,
            );
            const chatList = await this.chatService.chatList(data.recipient_id);
            this.io.to(recipient.socket_id).emit('conversation', conversation);
            this.io.to(recipient.socket_id).emit('chatList', chatList);
        }
        return result;
    }

    @SubscribeMessage('typingNotifier')
    async handleTyping(
        @ConnectedSocket() client: SocketWithAuth,
        @MessageBody() data: ListMessagesDto, // Need `recipient_id` from here
    ) {
        const recipient = await this.chatService.getRecipient(
            data.recipient_id,
        );
        if (recipient) {
            this.io.to(recipient.socket_id).emit('typingNotifier', true);
        }
        return;
    }
}
