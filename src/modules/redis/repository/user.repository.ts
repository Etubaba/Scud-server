import { Injectable } from '@nestjs/common';
import { Location, PaymentMode } from '@prisma/client';
import { Entity, Schema, Client, Point } from 'redis-om';
import { SocketUsers } from 'src/common/types/socketConnectedUsers.type';
import RidesHelper from '../../rides/helpers/rides.helpers';
import { RedisRepositoryService } from '../services/redis-repository.service';

export class UsersOnline extends Entity {}
@Injectable()
export class UsersOnlineRepository {
    private schema: Schema<UsersOnline>;
    private client: Client;

    constructor(private readonly redis: RedisRepositoryService) {
        const client = redis.getClient();
        const schema = new Schema(
            UsersOnline,
            {
                id: { type: 'number' },
                location: { type: 'point' },
                is_online: { type: 'boolean' },
                driverScore: { type: 'number', sortable: true },
                is_in_ride: { type: 'boolean' },
                fence: { type: 'text' },
                arrival_time: { type: 'number' },
                role: { type: 'string' },
                socket_id: { type: 'string' },
                acceptable_rides: { type: 'string' },
                vehicle_type: { type: 'string' },
            },
            { dataStructure: 'JSON', indexedDefault: true },
        );

        this.client = client;
        this.schema = schema;
    }

    async getRepository() {
        const userRepository = this.client.fetchRepository(this.schema);
        await userRepository.createIndex();
        return userRepository;
    }

    async push(data: SocketUsers) {
        const userRepository = await this.getRepository();
        return userRepository.createAndSave(data);
    }

    async get(id: number) {
        const userRepository = await this.getRepository();
        const record = await userRepository
            .search()
            .where('id')
            .equals(id)
            .first();
        return record?.toJSON() as SocketUsers | null;
    }

    async list() {
        const userRepository = await this.getRepository();
        return await userRepository.search().all();
    }

    async update(id: number, data: SocketUsers) {
        const oldData = await this.get(id);
        const entityId = oldData['entityId'];
        await this.delete(entityId);
        await this.push(data);
        return data;
    }

    async delete(id: string) {
        const userRepository = await this.getRepository();
        return await userRepository.remove(id);
    }
    async findAllDrivers() {
        const usersRepository = await this.getRepository();
        const allOnline = await usersRepository
            .search()
            .where((s) => {
                s.where('role')
                    .equals('driver')
                    .and((s) => {
                        s.where('is_online').equals(true);
                        return s;
                    });
                return s;
            })
            .all();
        const allOffline = await usersRepository
            .search()
            .where((s) => {
                s.where('role')
                    .equals('driver')
                    .and((s) => {
                        s.where('is_online').equals(false);
                        return s;
                    });
                return s;
            })
            .all();
        return {
            online: allOnline,
            offline: allOffline,
        };
    }
    async findAllDriversForRide(
        location: string,
        mode: PaymentMode,
        vehicle_type: string,
    ) {
        console.log(location);
        const usersRepository = await this.getRepository();
        const all = await usersRepository
            .search()
            .where((s) => {
                s.where('role')
                    .equals('driver')
                    .and((s) => {
                        s.where('is_online').equals(true);
                        return s;
                    })
                    .and((s) => {
                        s.where('vehicle_type').equals(vehicle_type);
                        return s;
                    })
                    .and((s) => {
                        s.where('is_in_ride').equals(false);
                        return s;
                    });
                return s;
            })
            .all();

        return all
            .map((map) => map.toJSON() as SocketUsers)
            .filter((driver) => driver.fence == location)
            .filter((driver) => {
                switch (mode) {
                    case 'card':
                        return true;
                    case 'cash':
                        return (
                            driver.acceptable_rides == 'both' ||
                            driver.acceptable_rides == 'card'
                        );
                }
            });
    }

    async findClosestDriver(
        pickup: Point,
        location: Location,
        mode: PaymentMode,
        vehicle_type: string,
    ) {
        const allDrivers = await this.findAllDriversForRide(
            location.name,
            mode,
            vehicle_type,
        );
        const data = allDrivers;
        return RidesHelper.filterAndSort(data, pickup);
    }
}
