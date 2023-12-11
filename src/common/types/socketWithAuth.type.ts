import { User } from '@prisma/client';
import { Socket } from 'socket.io';

export type AuthPayload = {
    user: User;
};
export type SocketWithAuth = Socket & AuthPayload;
