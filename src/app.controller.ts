import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { BypassVerification } from './modules/auth/decorators/bypass-verification.decorator';
import { Guest } from './modules/auth/decorators/public.decorator';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Guest()
    @BypassVerification()
    @Get('/')
    getHello(): string {
        return this.appService.getHello();
    }
}
