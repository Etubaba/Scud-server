import { Global, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Global()
@Module({
    providers: [UsersService],
    controllers: [UsersController],
    exports: [UsersService],
    imports: [AuthModule],
})
export class UsersModule {}
