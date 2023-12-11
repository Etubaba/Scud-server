import {
    BadRequestException,
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import * as moment from 'moment';
import { OrmService } from 'src/database/orm.service';
import { PaginationService } from 'src/database/pagination.service';
import { UsersService } from 'src/modules/users/users.service';
import { CreatePromoDto } from '../dto/create-promo.dto';
import { UpdatePromoDto } from '../dto/update-promo.dto';

@Injectable()
export class PromoService {
    model: string = 'promo';
    constructor(
        private readonly ormService: OrmService,
        private readonly paginationService: PaginationService,
        private readonly usersService: UsersService,
    ) {}

    async list(query: any, request: Request) {
        return await this.paginationService.paginate(
            request,
            this.model,
            query,
            {
                id: true,
                code: true,
                amount: true,
                expiry: true,
                is_active: true,
                description: true,
                number_of_rides: true,
                payment_type: true,
                created_at: true,
                updated_at: true,
                city_id: true,
                users: {
                    select: {
                        user: {
                            select: {
                                id: true,
                                first_name: true,
                                last_name: true,
                            },
                        },
                    },
                },
                city: {
                    select: {
                        id: true,
                        name: true,
                        state: {
                            select: {
                                id: true,
                                name: true,
                                country: {
                                    select: {
                                        id: true,
                                        name: true,
                                        currency: true,
                                        currency_symbol: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        );
    }

    async create(dto: CreatePromoDto) {
        if (moment(dto.expiry).isSameOrBefore(moment())) {
            throw new BadRequestException('Expiry must be greater than date');
        }
        const query = {
            where: {},
            select: { id: true },
        };
        if (dto.user_ids && dto.user_ids.length) {
            query.where = {
                id: {
                    in: dto.user_ids,
                },
            };
        }

        const users = (await this.usersService.findMany(query)).map((user) => ({
            user_id: user.id,
        }));

        const promo = await this.ormService.promo.create({
            data: {
                code: dto.code,
                amount: dto.amount,
                city_id: dto.city_id,
                expiry: moment(dto.expiry).format(),
                is_active: dto.is_active,
                description: dto.description,
                number_of_rides: dto.number_of_rides,
                payment_type: dto.promo_payment_type,
                users: {
                    createMany: {
                        data: users,
                    },
                },
            },
            include: {
                users: {
                    select: {
                        user: {
                            select: {
                                id: true,
                                first_name: true,
                                last_name: true,
                            },
                        },
                    },
                },
            },
        });
        return promo;
    }

    async find(id: number) {
        const promo = await this.ormService.promo.findUnique({
            where: {
                id: id,
            },
            include: {
                users: {
                    select: {
                        user: true,
                    },
                },
                city: {
                    select: {
                        id: true,
                        longitude: true,
                        latitude: true,
                        name: true,
                        state: {
                            select: {
                                id: true,
                                name: true,
                                latitude: true,
                                longitude: true,
                                country: {
                                    select: {
                                        name: true,
                                        currency: true,
                                        currency_symbol: true,
                                        latitude: true,
                                        longitude: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!promo) {
            throw new HttpException('Record not found', HttpStatus.NOT_FOUND);
        }
        return promo;
    }

    async findByCode(code: string) {
        const promo = await this.ormService.promo.findUnique({
            where: {
                code,
            },
            include: {
                users: {
                    select: {
                        user: true,
                    },
                },
            },
        });
        if (!promo) {
            throw new HttpException('Record not found', HttpStatus.NOT_FOUND);
        }
        return promo;
    }
    async update(id: number, dto: UpdatePromoDto) {
        if (dto.expiry && moment(dto.expiry).isSameOrBefore(moment())) {
            throw new BadRequestException('Expiry must be greater than date');
        }
        const ids = dto.user_ids || [];
        const promo = await this.find(id);
        const savedUsers = await this.ormService.promoUsers.findMany({
            where: {
                promo_id: promo.id,
            },
        });

        const savedUserIds = savedUsers.map((user) => user.user_id);
        const newUserIds = ids.filter(
            (userId) => !savedUserIds.includes(userId),
        );
        const removedUserIds = savedUserIds.filter(
            (savedUserId) => !ids.includes(savedUserId),
        );

        if (newUserIds.length > 0) {
            const users = await this.usersService.findMany({
                where: {
                    id: {
                        in: newUserIds,
                    },
                },
            });
            const promoUsers = users.map((user) => {
                return {
                    promo_id: promo.id,
                    user_id: user.id,
                };
            });
            await this.ormService.promoUsers.createMany({
                data: promoUsers,
            });
        }

        if (removedUserIds.length > 0) {
            await this.ormService.promoUsers.deleteMany({
                where: {
                    AND: [
                        {
                            promo_id: promo.id,
                        },
                        {
                            user_id: {
                                in: removedUserIds,
                            },
                        },
                    ],
                },
            });
        }
        return await this.ormService.promo.update({
            where: {
                id,
            },
            data: {
                code: dto.code,
                amount: dto.amount,
                city_id: dto.city_id,
                expiry: moment(dto.expiry).format(),
                is_active: dto.is_active,
                description: dto.description,
                number_of_rides: dto.number_of_rides,
                payment_type: dto.promo_payment_type,
            },
            include: {
                users: {
                    include: {
                        user: true,
                    },
                },
            },
        });
    }

    async remove(id: number) {
        await this.find(id);
        return this.ormService.promo.delete({
            where: {
                id,
            },
        });
    }
}
