import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { Discount, User } from '@prisma/client';
import { Request } from 'express';
import * as moment from 'moment';
import { OrmService } from 'src/database/orm.service';
import { PaginationService } from 'src/database/pagination.service';
import { LocationServices } from 'src/modules/location/services/location.service';
import { UsersService } from 'src/modules/users/users.service';
import { CheckPromoDto } from '../dto/check_promo.dto';
import { CreateDiscountDto } from '../dto/create_discount.dto';
import { UpdateDiscountDto } from '../dto/update_discount.dto';

@Injectable()
export class DiscountService {
    constructor(
        private readonly ormService: OrmService,
        private readonly usersService: UsersService,
        private readonly paginationService: PaginationService,
        private readonly locationsService: LocationServices,
    ) {}

    async create(dto: CreateDiscountDto): Promise<Discount> {
        const discount = await this.ormService.discount.create({
            data: {
                type: dto.type,
                start_date: moment(dto.start_date).toDate(),
                end_date: moment(dto.end_date).toDate(),
                is_active: dto.is_active,
                location_id: dto.location_id,
                no_of_trips: dto.no_of_trips,
                percentage: dto.percentage,
                total: dto.total,
            },
        });
        switch (dto.type) {
            case 'active': {
                const activeUsers = (await this.usersService.findMany({
                    where: {
                        is_active: true,
                    },
                })) as User[];
                activeUsers.forEach(async (user) => {
                    await this.ormService.discountUsers.create({
                        data: {
                            discount_id: discount.id,
                            user_id: user.id,
                        },
                    });
                });
            }
            case 'inactive': {
                const activeUsers = (await this.usersService.findMany({
                    where: {
                        is_active: false,
                    },
                })) as User[];
                activeUsers.forEach(async (user) => {
                    await this.ormService.discountUsers.create({
                        data: {
                            discount_id: discount.id,
                            user_id: user.id,
                        },
                    });
                });
            }
            // case 'dangerzone':{
            //     //NOTHING TO DO
            // }
            // case 'default':{
            //     //NOTHING TO DO
            // }
            // case 'event' : {
            //     //NOTHING TO DO
            // }
            // case 'location' : {
            //NOTHING TO DO
            // }
        }
        return discount;
    }

    async list(query: any, request: Request) {
        return this.paginationService.paginate(request, 'discount', query, {
            id: true,
            is_active: true,
            percentage: true,
            start_date: true,
            end_date: true,
            location: true,
            type: true,
            total: true,
            no_of_trips: true,
            users: true,
            created_at: true,
            updated_at: true,
        });
    }

    async find(id: number) {
        const discount = await this.ormService.discount.findFirst({
            where: {
                id,
            },
            select: {
                id: true,
                is_active: true,
                percentage: true,
                start_date: true,
                end_date: true,
                location: true,
                type: true,
                total: true,
                no_of_trips: true,
                users: true,
                created_at: true,
                updated_at: true,
            },
        });
        if (!discount) {
            throw new BadRequestException('Record Not found');
        }
        return discount;
    }

    async delete(id: number) {
        await this.find(id);
        return this.ormService.discount.delete({
            where: {
                id,
            },
        });
    }

    async update(id: number, dto: UpdateDiscountDto) {
        await this.find(id);
        return this.ormService.discount.update({
            where: {
                id,
            },
            data: {
                type: dto.type,
                start_date: moment(dto.start_date).toDate(),
                end_date: moment(dto.end_date).toDate(),
                is_active: dto.is_active,
                location_id: dto.location_id,
                no_of_trips: dto.no_of_trips,
                percentage: dto.percentage,
                total: dto.total,
            },
        });
    }

    async checkPromo(user_id: number, dto: CheckPromoDto) {
        const user = await this.usersService.findOne(user_id);
        const pickup = await this.locationsService.findByPoint(dto.pickup);
        const dropoff = await this.locationsService.findByPoint(
            dto.destination,
        );
        const active = await this.ormService.discountUsers.findFirst({
            where: {
                user_id: user.id,
                discount: {
                    type: 'active',
                },
            },
        });
        const inactive = await this.ormService.discountUsers.findFirst({
            where: {
                user_id: user.id,
                discount: {
                    type: 'inactive',
                },
            },
        });
        let dangerzone_discount: Discount,
            event_discount: Discount,
            default_discount: Discount;

        if (pickup) {
            const discount = await this.ormService.discount.findFirst({
                where: {
                    location_id: pickup.id,
                    type: 'dangerzone',
                },
            });
            if (discount) {
                const isUsed =
                    (await this.ormService.discountUsers.count({
                        where: {
                            user_id: user.id,
                            discount_id: discount.id,
                            used: true,
                        },
                    })) >= discount.no_of_trips;
                if (!isUsed) dangerzone_discount = discount;
            }
        }
        if (dropoff) {
            const discount = await this.ormService.discount.findFirst({
                where: {
                    location_id: pickup.id,
                    type: 'event',
                },
            });
            if (discount) {
                const isUsed =
                    (await this.ormService.discountUsers.count({
                        where: {
                            user_id: user.id,
                            discount_id: discount.id,
                            used: true,
                        },
                    })) >= discount.no_of_trips;
                if (!isUsed) event_discount = discount;
            }
        }
        default_discount = await this.ormService.discount.findFirst({
            where: {
                type: 'default',
                start_date: {
                    gte: user.created_at,
                },
                end_date: {
                    lt: new Date(),
                },
            },
        });
        return {
            inactive,
            active,
            dangerzone_discount,
            event_discount,
            default_discount,
        };
    }
}
