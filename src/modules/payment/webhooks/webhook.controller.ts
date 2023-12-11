import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { WebhookService } from './services/webhook.service';
import { Request, Response } from 'express';

@Controller('webhook')
export class WebhookController {
    constructor(private readonly webHookService: WebhookService) {}
    @Post('/paystack')
    async paystack(@Body() body, @Req() req: Request, @Res() res: Response) {
        const hash = <string>req.headers['x-paystack-signature'];
        await this.webHookService.verifyPaystackOrigin(hash, req.body);
        res.status(200).send();
        await this.webHookService.validatePaystackRequest(body.data);
    }

    @Post('/flutterwave')
    async flutterwave(@Body() body, @Req() req: Request, @Res() res: Response) {
        res.status(200).send();
        await this.webHookService.validateFlutterwaveRequest(body.data);
    }
}
