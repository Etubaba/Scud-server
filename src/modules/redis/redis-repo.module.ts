import { Module } from '@nestjs/common';
import { UsersOnlineRepository } from './repository/user.repository';
import { RedisRepositoryService } from './services/redis-repository.service';
import { ChatRoomRepository } from './repository/chat-room.repository';

@Module({
    providers: [
        RedisRepositoryService,
        UsersOnlineRepository,
        ChatRoomRepository,
    ],
    exports: [UsersOnlineRepository, ChatRoomRepository],
})
export class RedisRepositoryModule {}
