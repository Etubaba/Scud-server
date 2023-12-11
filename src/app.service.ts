import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
    constructor(private configService: ConfigService) {}

    getHello(): string {
        return `App running on ${this.configService.get(
            'app.host',
        )}:${this.configService.get('app.port')}`;
    }
}
