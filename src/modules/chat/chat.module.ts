import { Module } from '@nestjs/common';
import { ChatGateway } from 'src/modules/chat/chat.gateway';
import { RedisRepositoryModule } from '../redis/redis-repo.module';
import { ChatRoomRepository } from '../redis/repository/chat-room.repository';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';

@Module({
    imports: [RedisRepositoryModule],
    providers: [ChatGateway, ChatService],
    controllers: [ChatController],
})
export class ChatModule {}
