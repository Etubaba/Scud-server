import { Client, Entity, Schema } from 'redis-om';
import { RequestRoom as RRoom } from 'src/common/types/socketConnectedUsers.type';
export class RequestRoom extends Entity {}
export class RequestRoomRepository {
    private client: Client;
    private schema: Schema<RequestRoom>;

    constructor(client: Client) {
        this.client = client;
        this.schema = new Schema(RequestRoom, {
            id: { type: 'number' },
            rider_id: { type: 'number' },
            current_driver_id: { type: 'number' },
            next_driver_ids: { type: 'string[]' },
        });
    }

    static getInstance(client: Client) {
        const instance = new RequestRoomRepository(client);
        return instance;
    }

    getRepository() {
        const repo = this.client.fetchRepository(this.schema);
        return repo;
    }

    async push(data: RRoom) {
        const info = await this.getRepository().createAndSave(data);
        return info;
    }

    async update(id: number, data: RRoom) {
        const oldData = await this.get(id);
        const entityId = oldData['entityId'];
        await this.delete(entityId);
        await this.push(data);

        return data;
    }

    async delete(id: string) {
        return this.getRepository().remove(id);
    }

    async get(id: number) {
        const info = await this.getRepository()
            .search()
            .where('rider_id')
            .equals(id)
            .first();
        if (!info) {
            return null;
        }
        return info.toJSON() as RRoom;
    }
}
