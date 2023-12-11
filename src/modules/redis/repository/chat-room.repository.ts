import { Injectable } from '@nestjs/common';
import { Client, Entity, Repository, Schema } from 'redis-om';
import { ChatUser } from 'src/common/types/socketChatUser.type';
import { RedisRepositoryService } from '../services/redis-repository.service';

export class OnlineChatUser extends Entity {}
@Injectable()
export class ChatRoomRepository {
    private schema: Schema<OnlineChatUser>;
    private client: Client;
    private repository: Repository<OnlineChatUser>;

    constructor(private readonly redis: RedisRepositoryService) {
        this.client = redis.getClient();
        this.schema = new Schema(
            OnlineChatUser,
            {
                id: { type: 'number' },
                socket_id: { type: 'string' },
            },
            {
                dataStructure: 'JSON',
                indexedDefault: true,
            },
        );
        this.initRepository();
    }

    private async initRepository() {
        console.log(this.schema);
        this.repository = this.client.fetchRepository(this.schema);
        await this.repository.createIndex();
    }

    async push(data: ChatUser) {
        return await this.repository.createAndSave(data);
    }

    async get(id: number): Promise<ChatUser | null> {
        const user = await this.repository
            .search()
            .where('id')
            .equal(id)
            .first();

        if (!user) return null;

        return user.toJSON() as ChatUser;
    }

    async list() {
        return this.repository.search().all();
    }

    async delete(id: number) {
        const user = await this.repository
            .search()
            .where('id')
            .equal(id)
            .first();

        return this.repository.remove(user.entityId);
    }
}
