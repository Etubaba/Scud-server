// import { ConfigService } from '@nestjs/config';
import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class OrmService extends PrismaClient implements OnModuleInit {
    // constructor(private configService: ConfigService) {}

    async onModuleInit() {
        await this.$connect();
    }

    async enableShutdownHooks(app: INestApplication) {
        this.$on('beforeExit', async () => {
            await app.close();
        });
    }

    // private getValue(key: string, throwOnMissing = true): string {
    //     const value = this.configService.get(key);
    //     if (!value && throwOnMissing) {
    //         throw new Error(`config error - missing env.${key}`);
    //     }
    //     return value;
    // }
}
