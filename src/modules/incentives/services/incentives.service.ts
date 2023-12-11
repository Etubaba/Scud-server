import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { OrmService } from 'src/database/orm.service';
import { PaginationService } from 'src/database/pagination.service';
import { CreateIncentivesDto } from '../dto/create-incentives.dto';
import { UpdateIncentivesDto } from '../dto/update-incentives.dto';

@Injectable()
export class IncentivesService {
    model: string = 'incentive';
    constructor(
        private readonly ormService: OrmService,
        private readonly paginationService: PaginationService,
    ) {}

    async list(query: any, request: Request) {
        return await this.paginationService.paginate(
            request,
            this.model,
            query,
            {
                id: true,
                name: true,
                description: true,
                duration: true,
                reward: true,
                rides: true,
                previous_tier_id: true,
                is_active: true,
                created_at: true,
                updated_at: true,
                previous_tier: true,
                next_tier: true,
            },
        );
    }

    async create(createIncentivesDto: CreateIncentivesDto) {
        // Finds Incentive with same name already exists
        const nameExist = await this.ormService.incentive.findFirst({
            where: {
                name: createIncentivesDto.name,
            },
        });

        // Throws Http Exception if any is found
        if (nameExist) {
            throw new HttpException(
                'Incentive already exists',
                HttpStatus.CONFLICT,
            );
        }

        if (createIncentivesDto.previous_tier_id) {
            // Finds Incentive with previous_tier_id as id and Throws Http Exception if none is found
            await this.findOne(
                createIncentivesDto.previous_tier_id,
                'No Incentive with id found',
            );

            // Finds Incentive with same previous_tier_id exists
            const incentiveWithPreviousIdExist =
                await this.ormService.incentive.findFirst({
                    where: {
                        previous_tier_id: createIncentivesDto.previous_tier_id,
                    },
                });

            // Throws Http Exception if any is found
            if (incentiveWithPreviousIdExist) {
                throw new HttpException(
                    'Incentive with previous tier id already exists',
                    HttpStatus.CONFLICT,
                );
            }
        }

        return await this.ormService.incentive.create({
            data: {
                name: createIncentivesDto.name,
                description: createIncentivesDto.description,
                duration: createIncentivesDto.duration,
                reward: createIncentivesDto.reward,
                rides: createIncentivesDto.rides,
                is_active: createIncentivesDto.is_active,
                previous_tier_id: createIncentivesDto.previous_tier_id,
            },
        });
    }

    async findOne(id: number, message: string) {
        const incentive = await this.ormService.incentive.findUnique({
            where: {
                id: id,
            },
        });

        if (!incentive) {
            throw new HttpException(message, HttpStatus.NOT_FOUND);
        }
        return incentive;
    }

    async update(id: number, updateIncentivesDto: UpdateIncentivesDto) {
        await this.findOne(id, 'Record not found');

        // Finds Incentive with same name already exists
        if (updateIncentivesDto.name) {
            const nameExist = await this.ormService.incentive.findFirst({
                where: {
                    name: updateIncentivesDto.name,
                    NOT: {
                        id: id,
                    },
                },
            });
            // Throws Http Exception if any is found
            if (nameExist) {
                throw new HttpException(
                    'Incentive already exists',
                    HttpStatus.CONFLICT,
                );
            }
        }

        if (updateIncentivesDto.previous_tier_id) {
            // Finds Incentive with previous_tier_id as id and Throws Http Exception if none is found
            await this.findOne(
                updateIncentivesDto.previous_tier_id,
                'No Incentive with id found',
            );

            // Finds Incentive with same previous_tier_id exists
            const incentiveWithPreviousIdExist =
                await this.ormService.incentive.findFirst({
                    where: {
                        previous_tier_id: updateIncentivesDto.previous_tier_id,
                        NOT: {
                            id: id,
                        },
                    },
                });

            // Throws Http Exception if any is found
            if (incentiveWithPreviousIdExist) {
                throw new HttpException(
                    'Incentive with previous tier id already exists',
                    HttpStatus.CONFLICT,
                );
            }
        }

        const incentive = await this.ormService.incentive.update({
            where: {
                id: id,
            },
            data: {
                name: updateIncentivesDto.name,
                description: updateIncentivesDto.description,
                duration: updateIncentivesDto.duration,
                reward: updateIncentivesDto.reward,
                rides: updateIncentivesDto.rides,
                is_active: updateIncentivesDto.is_active,
                previous_tier_id: updateIncentivesDto.previous_tier_id,
            },
        });

        return incentive;
    }

    async remove(id: number) {
        await this.findOne(id, 'Record not found');

        return await this.ormService.incentive.delete({
            where: {
                id: id,
            },
        });
    }
}
