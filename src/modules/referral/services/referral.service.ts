import {
    forwardRef,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
} from '@nestjs/common';
import { OrmService } from 'src/database/orm.service';

import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class ReferralService {
    constructor(
        private readonly ormService: OrmService,
        private readonly userService: UsersService,
    ) {}
    async create(userId: number, ref: string) {
        const referrer = await this.ormService.user.findUnique({
            where: {
                referral_code: ref,
            },
        });
        if (!referrer) {
            throw new HttpException(
                'Referral Incorrect',
                HttpStatus.BAD_REQUEST,
            );
        }
        const isReferred = await this.ormService.referral.findFirst({
            where: {
                user_id: userId,
            },
        });
        if (isReferred) {
            throw new HttpException(
                'User is already referred',
                HttpStatus.BAD_REQUEST,
            );
        }
        const referral = await this.ormService.referral.create({
            data: {
                user_id: userId,
                referrer_id: referrer.id,
            },
        });
        return referral;
    }
    async list() {
        return await this.ormService.referral.findMany();
    }
}
