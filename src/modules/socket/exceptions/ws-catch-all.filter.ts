import {
    Catch,
    BadRequestException,
    ArgumentsHost,
    HttpException,
} from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

@Catch(HttpException)
export class BadRequestTransformationFilter extends BaseWsExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const properException = new WsException(exception.getResponse());
        super.catch(properException, host);
    }
}
