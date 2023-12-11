import { Inject, Injectable } from '@nestjs/common';
import { STRIPE_PROVIDER } from 'src/common/constants/constants';
import { TripsService } from 'src/modules/rides/services/trips.service';
import { UsersService } from 'src/modules/users/users.service';
import Stripe from 'stripe';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { BankAccountService } from '../services/bank-account.service';
import { TransactionService } from '../services/transaction.service';

@Injectable({})
export class StripeGateway {
    constructor(
        @Inject(STRIPE_PROVIDER) private readonly stripe: Stripe,
        private readonly transactionService: TransactionService,
        private readonly bankAccountService: BankAccountService,
        private readonly usersService: UsersService,
        private readonly tripService: TripsService,
    ) {}

    async initTransaction(dto: CreateTransactionDto) {
        const reference = `STRIPE-REF-${Date.now().toString()}`;
        const trip = await this.tripService.find(dto.trip_id);
        const transaction = await this.transactionService.create(
            {
                amount: trip.trip_fare.total_fare,
                currency: trip.trip_fare.currency,
                description: 'Payment for trip',
                receiver_id: trip.driver_id,
                sender_id: trip.rider_id,
                type: 'credit',
            },
            'stripe',
            reference,
        );
        const stripe = await this.stripe.checkout.sessions.create({
            line_items: [
                {
                    quantity: 1,
                    price_data: {
                        currency: trip.trip_fare.currency,
                        unit_amount: trip.trip_fare.total_fare * 100,
                    },
                },
            ],
            mode: 'payment',
            success_url: '',
            cancel_url: '',
            client_reference_id: `STRIPE-REF-${transaction.id}`,
        });
        return stripe.url;
    }
}
