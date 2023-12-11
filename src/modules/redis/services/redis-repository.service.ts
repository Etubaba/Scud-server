import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'redis-om';
@Injectable()
export class RedisRepositoryService {
    private client: Client;
    private readonly logger: Logger;

    constructor(private readonly configService: ConfigService) {
        try {
            this.client = new Client();
            this.client.open(configService.get('redis.redis_url'));
            this.logger = new Logger(RedisRepositoryService.name);
            this.logger.log('Redis Connected');
        } catch (e) {
            throw e;
        }
    }

    getClient(): Client {
        return this.client;
    }
}
