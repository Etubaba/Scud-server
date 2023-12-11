import { Injectable } from '@nestjs/common';
import { OrmService } from 'src/database/orm.service';
import { UsersService } from 'src/modules/users/users.service';
import { TransactionService } from './transaction.service';
import { TripsService } from 'src/modules/rides/services/trips.service';

@Injectable()
export class EarningsService {
    constructor(
        private readonly ormService: OrmService,
        private readonly usersService: UsersService,
        private readonly transactionService: TransactionService,
        private readonly tripServices: TripsService,
    ) {}

    async find(user_id: number, query: any) {
        const { start_date = undefined, end_date = new Date() } = query;
        const user = await this.usersService.findOne(user_id);
        const balance = user.account_balance;
        const transaction = await this.transactionService.listForUser(user_id);
        const earnings = (
            await this.tripServices.listByDriverForEarnings(
                user_id,
                'completed',
                end_date,
                start_date,
            )
        ).map((trip) => {
            return {
                date: trip.created_at,
                amount: trip.trip_fare.driver_commission,
            };
        });
        const net_earnings = earnings.reduce(
            (prev, curr) => prev + curr.amount,
            0,
        );

        return {
            net_earnings,
            earnings,
            transaction,
            balance,
        };
    }
}
