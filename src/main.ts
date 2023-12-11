import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { OrmService } from './database/orm.service';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { SentryService } from '@ntegral/nestjs-sentry';
import { SocketIOAdapter } from './modules/socket/adapters/socket-io.adapter';

declare const module: any;

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    app.setGlobalPrefix(configService.get('app.global_url_prefix'));
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ limit: '50mb', extended: true }));

    const config = new DocumentBuilder()
        .setTitle(configService.get('app.name'))
        .setDescription(`V1 API description`)
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    const ormService = app.get(OrmService);
    await ormService.enableShutdownHooks(app);

    app.useGlobalPipes(
        new ValidationPipe({
            disableErrorMessages: false,
            // transform: true,
        }),
    );
    app.useLogger(SentryService.SentryServiceInstance());
    app.useWebSocketAdapter(new SocketIOAdapter(app, configService));

    app.useWebSocketAdapter(new SocketIOAdapter(app, configService));
    app.enableCors({
        origin: configService.get('cors.origin'),
        methods: configService.get('cors.methods'),
    });

    const port = configService.get<number>('app.port');
    await app.listen(port);

    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => app.close());
    }
}
bootstrap();
