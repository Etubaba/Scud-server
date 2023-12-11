import { Injectable, NotFoundException } from '@nestjs/common';
import { ChatMessage, ChatUser } from 'src/common/types/socketChatUser.type';
import { SocketWithAuth } from 'src/common/types/socketWithAuth.type';
import { OrmService } from 'src/database/orm.service';
import { ChatRoomRepository } from '../redis/repository/chat-room.repository';
import { CreateMessageDto } from './dtos/create-message.dto';
import { Message, User } from '@prisma/client';
import { type } from 'os';

type ChatListUser = User & {
    sent_messages: Message[];
    received_messages: Message[];
    last_message?: Message;
    unread_messages?: number;
};

@Injectable()
export class ChatService {
    constructor(
        private readonly ormService: OrmService,
        private readonly chatRoomRepository: ChatRoomRepository,
    ) {}

    /**
     * It takes a socket client as an argument, and returns a list of messages between the client and
     * the recipient
     * @param {SocketWithAuth} client - SocketWithAuth - this is the socket connection that is passed
     * to the connect method.
     * @returns The messages between the two users.
     */
    async connect(client: SocketWithAuth) {
        const user: ChatUser = {
            id: client.user.id,
            socket_id: client.id,
        };

        const userExists = await this.chatRoomRepository.get(user.id);

        if (userExists) return;

        const userOnline = await this.chatRoomRepository.push(user);

        return userOnline;
    }

    /**
     * It removes the user from the chat room
     * @param {SocketWithAuth} client - SocketWithAuth - This is the socket that is being disconnected.
     * @returns Nothing
     */
    async disconnect(client: SocketWithAuth) {
        const user = await this.chatRoomRepository.get(client.user.id);

        if (!user) return;

        await this.chatRoomRepository.delete(user.id);

        return;
    }

    async create(data: ChatMessage, user_id: number) {
        const recipient = await this.chatRoomRepository.get(data.recipient_id);

        const message = await this.ormService.message.create({
            data: {
                sender_id: user_id,
                recipient_id: data.recipient_id,
                content: data.content,
            },
        });

        return {
            recipient,
            message,
        };
    }

    async list(user_id: number, recipient_id: number) {
        const messages = await this.ormService.message.findMany({
            where: {
                OR: [
                    {
                        recipient_id: recipient_id,
                        sender_id: user_id,
                    },
                    {
                        recipient_id: user_id,
                        sender_id: recipient_id,
                    },
                ],
            },
            orderBy: [{ created_at: 'asc' }],
        });

        return messages;
    }

    async getRecipient(recipient_id: number) {
        return await this.chatRoomRepository.get(recipient_id);
    }

    async chatList(user_id: number) {
        const user = await this.ormService.user.findFirst({
            where: {
                id: user_id,
            },
            include: {
                drivers: {
                    select: {
                        user_id: true,
                    },
                },
                account_managers: {
                    select: {
                        manager_id: true,
                    },
                },
                supervisor: {
                    select: {
                        supervisor_id: true,
                    },
                },
            },
        });

        const chats = await this.ormService.message.groupBy({
            by: ['recipient_id', 'sender_id'],
            where: {
                OR: [{ recipient_id: user_id }, { sender_id: user_id }],
            },
        });

        let user_ids = chats.map((v) => Object.values(v)).flat(1);

        if (user.supervisor) {
            user_ids = [...user_ids, user.supervisor.supervisor_id];
        }

        if (user.account_managers) {
            user_ids = [
                ...user_ids,
                ...user.account_managers.map((v) => v.manager_id),
            ];
        }

        if (user.drivers) {
            user_ids = [...user_ids, ...user.drivers.map((v) => v.user_id)];
        }

        const users = await this.ormService.user.findMany({
            where: {
                id: {
                    in: user_ids.filter((u) => u !== user_id),
                },
            },
            include: {
                sent_messages: true,
                received_messages: true,
            },
        });

        return this.cleanChatList(users);
    }

    async readMessages(message_id: number[], user_id: number) {
        const messages = await this.ormService.message.findMany({
            where: {
                id: {
                    in: message_id,
                },
            },
        });

        if (messages.length === 0) {
            throw new NotFoundException('Record not found');
        }

        return await this.ormService.message.updateMany({
            where: {
                id: {
                    in: message_id,
                },
                recipient_id: user_id,
            },
            data: {
                is_read: true,
            },
        });
    }

    /**
     * It takes an array of users, and returns an array of users with the following properties:
     *
     * - `unread_messages`: the number of unread messages
     * - `last_message`: the last message sent or received
     *
     * The function also removes the following properties:
     *
     * - `sent_messages`
     * - `received_messages`
     *
     * The function also sorts the users by the time of their last message
     * @param {ChatListUser[]} users - ChatListUser[]
     */
    async cleanChatList(users: ChatListUser[]) {
        const newUsers = users.map((u) => {
            const all_messages = [...u.sent_messages, ...u.received_messages];

            u.unread_messages = u.sent_messages.filter(
                (m) => !m.is_read,
            ).length;

            delete u.sent_messages;
            delete u.received_messages;

            u.last_message =
                all_messages
                    .sort(
                        (objA, objB) =>
                            Number(objB.created_at) - Number(objA.created_at),
                    )
                    .at(0) || null;

            return u;
        });

        return newUsers.sort(
            (user1, user2) =>
                Number(user2.last_message ? user2.last_message.created_at : 0) -
                Number(user1.last_message ? user1.last_message.created_at : 0),
        );
    }
}
