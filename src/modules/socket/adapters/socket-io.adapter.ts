import { INestApplicationContext, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { WsException } from '@nestjs/websockets';
import { Server, ServerOptions } from 'socket.io';
import { SocketWithAuth } from 'src/common/types/socketWithAuth.type';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { UsersService } from 'src/modules/users/users.service';

export class SocketIOAdapter extends IoAdapter {
    private readonly logger = new Logger(SocketIOAdapter.name);
    constructor(
        private app: INestApplicationContext,
        private configService: ConfigService,
    ) {
        super(app);
    }

    createIOServer(port: number, options?: ServerOptions) {
        const jwtService = this.app.get(JwtService);
        const authService = this.app.get(UsersService);
        const server: Server = super.createIOServer(port, options);
        const secret = this.configService.get('jwt.access.secret');
        server
            .of('rides')
            .use(
                createTokenMiddleware(
                    jwtService,
                    this.logger,
                    authService,
                    secret,
                ),
            );
        server
            .of('chats')
            .use(
                createTokenMiddleware(
                    jwtService,
                    this.logger,
                    authService,
                    secret,
                ),
            );
        return server;
    }
}

const createTokenMiddleware =
    (
        jwtService: JwtService,
        logger: Logger,
        userService: UsersService,
        secret: string,
    ) =>
    async (socket: SocketWithAuth, next) => {
        const token = socket.handshake.headers.authorization;
        try {
            const payload = jwtService.verify(token, { secret });
            const user = await userService.findOne(payload.sub);
            socket.user = user;
            next();
        } catch (e) {
            //throw new WsException('User not found')
            next(new WsException('Invalid credentials'));
        }
    };
