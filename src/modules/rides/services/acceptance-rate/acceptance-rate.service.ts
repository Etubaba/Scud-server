import { Injectable } from '@nestjs/common';
import { OrmService } from 'src/database/orm.service';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class AcceptanceRateService {
    constructor(
        private readonly usersService: UsersService,
        private readonly ormService: OrmService,
    ) {}
    async get(id: number, query: any) {
        const { start_date = undefined, end_date = new Date() } = query;
        await this.usersService.findOne(id);
        const total = await this.ormService.trip.count({
            where: {
                driver_id: id,
            },
        });
        const accepted = await this.ormService.trip.findMany({
            where: {
                driver_id: id,
                status: {
                    in: ['completed', 'ongoing'],
                },
                created_at: {
                    gte: start_date,
                    lte: end_date,
                },
            },
        });
        const declined = await this.ormService.trip.findMany({
            where: {
                driver_id: id,
                status: 'cancelled',
                cancelledBy: 'driver',
                created_at: {
                    gte: start_date,
                    lte: end_date,
                },
            },
        });
        const cannceled = await this.ormService.trip.findMany({
            where: {
                driver_id: id,
                status: 'cancelled',
                cancelledBy: 'rider',
                created_at: {
                    gte: start_date,
                    lte: end_date,
                },
            },
        });
        const totalcancelled = cannceled.length + declined.length;
        return { total, totalcancelled, cannceled, declined, accepted };
    }
}
