import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { OrmService } from 'src/database/orm.service';
import { CreateTermsOfServicesDto } from '../dtos/create-terms-of-services.dto';
import { UpdateTermsOfServicesDto } from '../dtos/update-terms-of-services.dto';
import { PaginationService } from 'src/database/pagination.service';
import { Request } from 'express';

@Injectable()
export class TermsOfServicesService {
    private model: string = 'termsOfService';

    constructor(
        private readonly ormServices: OrmService,
        private readonly paginationService: PaginationService,
    ) {}

    async list(query: any, request: Request) {
        return await this.paginationService.paginate(
            request,
            this.model,
            query,
            {
                id: true,
                title: true,
                content: true,
                category: true,
                is_active: true,
                created_at: true,
                updated_at: true,
            },
        );
    }

    async create(dto: CreateTermsOfServicesDto) {
        const termsExists = await this.ormServices.termsOfService.findFirst({
            where: {
                title: dto.title,
            },
        });

        if (termsExists) {
            throw new HttpException(
                'Terms of service already exists',
                HttpStatus.CONFLICT,
            );
        }

        return await this.ormServices.termsOfService.create({
            data: {
                title: dto.title,
                content: dto.content,
                category: dto.category,
                is_active: dto.is_active,
            },
        });
    }

    async findOne(id: number) {
        const termsOfService = await this.ormServices.termsOfService.findUnique(
            {
                where: { id },
            },
        );

        if (!termsOfService) {
            throw new HttpException(
                'Terms of services not found',
                HttpStatus.NOT_FOUND,
            );
        }

        return termsOfService;
    }

    async update(dto: UpdateTermsOfServicesDto, id: number) {
        await this.findOne(id);

        const termsExists = await this.ormServices.termsOfService.findFirst({
            where: {
                title: dto.title,
                category: dto.category,
                NOT: {
                    id,
                },
            },
        });

        if (termsExists) {
            throw new HttpException(
                'Terms of service already exists',
                HttpStatus.CONFLICT,
            );
        }

        return await this.ormServices.termsOfService.update({
            where: { id },
            data: {
                title: dto.title,
                content: dto.content,
                category: dto.category,
                is_active: dto.is_active,
            },
        });
    }

    async remove(id: number) {
        await this.findOne(id);

        return this.ormServices.termsOfService.delete({
            where: { id },
        });
    }
}
