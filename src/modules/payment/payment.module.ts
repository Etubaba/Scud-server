import { Module } from '@nestjs/common';
import { BankAccountService } from './services/bank-account.service';
import { BankAccountController } from './controllers/bank-account.controller';
import { WithdrawalRequestController } from './controllers/withdrawal-request.controller';
import { WithdrawalRequestService } from './services/withdrawal-request.service';
import { TransactionController } from './controllers/transaction.controller';
import { TransactionService } from './services/transaction.service';
import { RidesModule } from '../rides/rides.module';
import { FlutterWaveGateway } from './gateways/flutterwave.gateway';
import { GatewayService } from './services/gateway/gateway.service';
import { PaystackGateway } from './gateways/paystack.gateway';
import { HttpModule } from '@nestjs/axios';
import { EarningsService } from './services/earnings.service';
import { EarningsController } from './controllers/earnings.controller';
import { BankController } from './controllers/bank.controller';
import { BankService } from './services/bank.service';

@Module({
    imports: [RidesModule, HttpModule.register({})],
    providers: [
        BankAccountService,
        WithdrawalRequestService,
        TransactionService,
        GatewayService,
        FlutterWaveGateway,
        PaystackGateway,
        EarningsService,
        BankService,
    ],
    controllers: [
        BankAccountController,
        WithdrawalRequestController,
        TransactionController,
        EarningsController,
        BankController,
    ],
})
export class PaymentModule {}
