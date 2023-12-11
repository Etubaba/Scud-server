import { HttpService } from '@nestjs/axios';
import {
    forwardRef,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
} from '@nestjs/common';
import { Transaction, TransactionStatus, User } from '@prisma/client';
import { catchError, lastValueFrom, map } from 'rxjs';
import { TripsService } from 'src/modules/rides/services/trips.service';
import { SettingsService } from 'src/modules/settings/services/settings.service';
import { UsersService } from 'src/modules/users/users.service';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { BankAccountService } from '../services/bank-account.service';
import { TransactionService } from '../services/transaction.service';
import { paymentMeta } from 'src/common/types/paymentMeta';

@Injectable()
export class PaystackGateway {
    private HOST: string = 'https://api.paystack.co';
    private AUTHORIZATION_HEADER: object = null;

    constructor(
        private readonly settingsService: SettingsService,
        private readonly httpService: HttpService,
        @Inject(forwardRef(() => TransactionService))
        private readonly transactionService: TransactionService,
        private readonly bankAccountService: BankAccountService,
        private readonly usersService: UsersService,
        private readonly tripService: TripsService,
    ) {}

    async initKeys() {
        const [secretKey, publicKey] = await Promise.all([
            this.settingsService.get('PAYSTACK_SECRET_KEY'),
            this.settingsService.get('PAYSTACK_PUBLIC_KEY'),
        ]);
        this.AUTHORIZATION_HEADER = {
            Authorization: `Bearer ${secretKey.value}`,
        };
        return { secretKey: secretKey.value, publicKey: publicKey.value };
    }

    async initTransaction(dto: CreateTransactionDto) {
        const INITIALIZE_URL = `${this.HOST}/transaction/initialize`;
        const reference = `PAYSTACK-REF-${Date.now().toString()}`;
        const trip = await this.tripService.find(dto.trip_id);
        const [from, to, transaction, _] = await Promise.all([
            this.usersService.findOne(trip.rider_id),
            this.usersService.findOne(trip.driver_id),
            this.transactionService.create(
                {
                    amount: trip.trip_fare.total_fare,
                    currency: trip.trip_fare.currency,
                    description: 'Payment for trip',
                    receiver_id: trip.driver_id,
                    sender_id: trip.rider_id,
                    type: 'credit',
                },
                'paystack',
                reference,
            ),
            this.initKeys(),
        ]);
        const meta: paymentMeta = {
            for: 'ride-payment',
            id: transaction.id,
            trip_id: dto.trip_id,
        };
        const { status, data } = await lastValueFrom(
            this.httpService
                .post(
                    INITIALIZE_URL,
                    {
                        email: from.email,
                        reference: reference,
                        amount: trip.trip_fare.total_fare * 100,
                        metadata: meta,
                    },
                    { headers: this.AUTHORIZATION_HEADER },
                )
                .pipe(
                    catchError((error) => {
                        throw new HttpException(
                            error?.response?.data || 'Failed',
                            error?.response?.status || HttpStatus.BAD_REQUEST,
                        );
                    }),
                    map((response) => response),
                ),
        );

        if (status === HttpStatus.OK && data.status) {
            return { success: true, url: data.data.authorization_url };
        }
    }

    async verify(ref: string) {
        await this.initKeys();
        const transaction = await this.transactionService.findOneByReference(
            ref,
        );
        const VERIFY_PAYMENT_URL = `${this.HOST}/transaction/verify/${transaction.reference}`;
        const {
            status,
            data: { data, metadata },
        } = await this.httpService.axiosRef.get(VERIFY_PAYMENT_URL, {
            headers: this.AUTHORIZATION_HEADER,
        });

        if (![HttpStatus.OK, HttpStatus.CREATED].includes(status)) {
            throw new HttpException(data?.message, status);
        }

        const responseStatus: TransactionStatus = [
            TransactionStatus.success,
            TransactionStatus.declined,
            TransactionStatus.abandoned,
        ].includes(data.status)
            ? data.status
            : TransactionStatus.failed;
        if (
            (metadata as paymentMeta).for == 'ride-payment' &&
            responseStatus == 'success'
        ) {
            await this.tripService.updateTripPay(metadata.trip_id, {
                paid: true,
            });
        }

        return await this.transactionService.update(transaction.id, {
            status: responseStatus,
        });
    }

    async createRecipient(user: User) {
        const [bank_info, _] = await Promise.all([
            this.bankAccountService.getByUser(user.id),
            this.initKeys(),
        ]);

        if (!bank_info || !bank_info.bank) {
            throw new HttpException(
                'User has no associated bank account',
                HttpStatus.BAD_REQUEST,
            );
        }

        const CREATE_RECEIPEINT_URL = `${this.HOST}/transferrecipient`;
        if (user.paystack_recipient_code) {
            return;
        }

        try {
            const { status, data } = await this.httpService.axiosRef.post(
                CREATE_RECEIPEINT_URL,
                {
                    bank_code: bank_info.bank.code,
                    account_number: bank_info.account_number,
                    name: bank_info.account_name,
                    type: 'nuban',
                },
                {
                    headers: this.AUTHORIZATION_HEADER,
                },
            );
            if (status == HttpStatus.CREATED && data.status == true) {
                return await this.usersService.updateFields(user.id, {
                    paystack_recipient_code: data.data.recipient_code,
                });
            }
            throw new HttpException('error creating recipient', status);
        } catch (error) {
            throw new HttpException(
                error?.response?.data?.message,
                error?.response?.status,
            );
        }
    }

    async transfer(user: User, amount: number, reason: string) {
        await Promise.all([this.initKeys(), this.createRecipient(user)]);
        const TRANSFER_URL = `${this.HOST}/transfer`;
        try {
            const { status, data } = await this.httpService.axiosRef.post(
                TRANSFER_URL,
                {
                    source: 'balance',
                    reason,
                    amount,
                    recipient: user.paystack_recipient_code || '',
                },
                {
                    headers: this.AUTHORIZATION_HEADER,
                },
            );

            if (![HttpStatus.OK, HttpStatus.CREATED].includes(status)) {
                throw new HttpException(data?.message, status);
            }
        } catch (error) {
            throw new HttpException(
                error?.response?.data?.message,
                error?.response?.status,
            );
        }
    }
}
