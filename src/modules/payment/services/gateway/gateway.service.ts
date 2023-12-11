import { Injectable } from '@nestjs/common';
import { SettingsService } from 'src/modules/settings/services/settings.service';
import { CreateTransactionDto } from '../../dto/create-transaction.dto';
import { FlutterWaveGateway } from '../../gateways/flutterwave.gateway';
import { PaystackGateway } from '../../gateways/paystack.gateway';

@Injectable()
export class GatewayService {
    constructor(
        private readonly settingsService: SettingsService,
        private readonly paystackGateway: PaystackGateway,
        private readonly flutterwaveGateway: FlutterWaveGateway,
    ) {}
    async initTransaction(dto: CreateTransactionDto) {
        const currentGateway = (
            await this.settingsService.get('ACTIVE_PAYMENT_GATEWAY')
        ).value;
        switch (currentGateway) {
            case 'PAYSTACK':
                return this.paystackGateway.initTransaction(dto);
            case 'FLUTTERWAVE':
                return this.flutterwaveGateway.initTransaction(dto);
            default:
                break;
        }
    }
}
