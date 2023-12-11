import { Channel } from '@prisma/client';

export type UserNotification = {
    user_id: number;
};

export type Notification = {
    subject: string;
    body: string;
    tags: string[];
    channel: Channel;
};

export type CreateNotification = Notification & { users: UserNotification[] };
