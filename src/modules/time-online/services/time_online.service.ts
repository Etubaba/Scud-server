import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { OrmService } from 'src/database/orm.service';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class TimeOnlineService {
    constructor(
        private readonly ormService: OrmService,
        private readonly usersService: UsersService,
    ) {}
    async create(
        user_id: number,
        data: {
            logout_date: moment.MomentInput;
            login_date: moment.MomentInput;
        },
    ) {
        await this.usersService.findOne(user_id);
        const offline = moment(data.logout_date).toDate();
        const online = moment(data.login_date).toDate();
        const time = moment(online).diff(offline, 'minutes');
        const timeonline = await this.ormService.timeOnline.create({
            data: {
                offline,
                online,
                time,
                user_id,
            },
        });
        return timeonline;
    }

    async list() {
        const data = await this.ormService.timeOnline.groupBy({
            by: ['user_id'],
            _sum: {
                time: true,
            },
        });
        return data;
    }

    async get(id: number) {
        const timesonline = await this.ormService.timeOnline.findFirst({
            where: {
                id,
            },
            select: {
                offline: true,
                online: true,
                updated_at: true,
                created_at: true,
                user: true,
                time: true,
                id: true,
            },
        });
        return timesonline;
    }

    async getByDriver(user_id: number) {
        await this.usersService.findOne(user_id);
        const timesonline = await this.ormService.timeOnline.findMany({
            where: {
                user_id,
            },
            select: {
                offline: true,
                online: true,
                updated_at: true,
                created_at: true,
                user: true,
                time: true,
                id: true,
            },
        });
        const group = await this.ormService.timeOnline.groupBy({
            by: ['user_id'],
            where: {
                user_id,
            },
            _sum: {
                time: true,
            },
        });

        return {
            info: group.map((val) => val._sum)[0],
            data: timesonline,
        };
    }
}
