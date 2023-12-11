import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { OrmService } from 'src/database/orm.service';
import { PaginationService } from 'src/database/pagination.service';
import { RolesService } from 'src/modules/auth/services/roles.service';
import { CreateCancelReasonDto } from '../dto/create-cancel-reason.dto';
import { UpdateCancelReasonDto } from '../dto/update-cancel-reason.dto';

@Injectable()
export class CancelReasonService {
    model: string = 'cancelReason';
    constructor(
        private readonly ormService: OrmService,
        private readonly rolesService: RolesService,
        private readonly paginationService: PaginationService,
    ) {}

    async list(query: any, request: Request) {
        return await this.paginationService.paginate(
            request,
            this.model,
            query,
            {
                id: true,
                reason: true,
                groups: true,
                is_active: true,
                deductible_score: true,
                created_at: true,
                updated_at: true,
            },
        );
    }

    async create(dto: CreateCancelReasonDto) {
        // const invalidGroups = dto.groups.filter(async (element) => {
        //     const rolesExists = await this.rolesService.findByName(element);
        //     return !rolesExists;
        // });

        // if (invalidGroups.length) {
        //     throw new HttpException(
        //         `[${invalidGroups.join(', ').toString()}] are not valid groups`,
        //         HttpStatus.BAD_REQUEST,
        //     );
        // }
        const exists = await this.ormService.cancelReason.findFirst({
            where: {
                reason: dto.reason,
                groups: {
                    hasSome: dto.groups,
                },
            },
        });
        if (exists) {
            throw new HttpException(
                'Reason already exists',
                HttpStatus.CONFLICT,
            );
        }
        return await this.ormService.cancelReason.create({
            data: {
                reason: dto.reason,
                deductible_score: dto.deductible_score,
                groups: dto.groups,
                is_active: dto.is_active,
            },
        });
    }

    async findOne(id: number) {
        const reason = await this.ormService.cancelReason.findUnique({
            where: {
                id: id,
            },
        });
        if (!reason) {
            throw new HttpException('Record not found', HttpStatus.NOT_FOUND);
        }
        return reason;
    }

    async remove(id: number) {
        await this.findOne(id);
        return await this.ormService.cancelReason.delete({
            where: {
                id: id,
            },
        });
    }

    async update(id: number, dto: UpdateCancelReasonDto) {
        await this.findOne(id);
        const condition = {
            reason: dto.reason,
            groups: {
                hasSome: dto.groups,
            },
            NOT: {
                id: id,
            },
        };

        const exists = await this.ormService.cancelReason.findFirst({
            where: condition,
        });
        if (dto.reason && exists) {
            throw new HttpException(
                'Reason already exists',
                HttpStatus.CONFLICT,
            );
        }
        return await this.ormService.cancelReason.update({
            where: {
                id: id,
            },
            data: {
                reason: dto.reason,
                is_active: dto.is_active,
                groups: dto.groups,
                deductible_score: dto.deductible_score,
            },
        });
    }
}
