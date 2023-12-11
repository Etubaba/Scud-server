import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SettingsService } from 'src/modules/settings/services/settings.service';
import crypto from 'crypto';
import { PaystackGateway } from '../../gateways/paystack.gateway';
import { FlutterWaveGateway } from '../../gateways/flutterwave.gateway';

@Injectable()
export class WebhookService {
    constructor(
        private readonly settingsService: SettingsService,
        private readonly paystackGateway: PaystackGateway,
        private readonly flutterwaveGateway: FlutterWaveGateway,
    ) {}
    async verifyPaystackOrigin(signature: string, body: any) {
        const secret = (await this.settingsService.get('PAYSTACK_SECRET_KEY'))
            .value;
        const hash = crypto
            .createHmac('sha512', secret)
            .update(JSON.stringify(body))
            .digest('hex');
        if (hash == signature) {
            throw new HttpException('', HttpStatus.OK);
        }
        throw new HttpException('', HttpStatus.BAD_REQUEST);
    }

    async validatePaystackRequest(data: any) {
        switch (data.event) {
            case 'charge.success':
                await this.paystackGateway.verify(data.reference);
        }
    }
    async validateFlutterwaveRequest(data: any) {
        switch (data.event) {
            case 'charge.completed':
                await this.flutterwaveGateway.verify(data.tx_ref);
        }
    }
}
