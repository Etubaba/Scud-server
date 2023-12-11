import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { OrmService } from 'src/database/orm.service';
import { PaginationService } from 'src/database/pagination.service';
import { CreateReviewDto } from '../dtos/create-review.dto';

@Injectable()
export class ReviewService {
    model: string = 'review';
    selectFields = {
        id: true,
        rating: true,
        reviewed: {
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                phone: true,
                gender: true,
            },
        },
        reviewer: {
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                phone: true,
                gender: true,
            },
        },
        comment: true,
        created_at: true,
        updated_at: true,
        trip: {
            select: {
                destination: true,
                pickup: true,
            },
        },
    };
    constructor(
        private readonly ormService: OrmService,
        private readonly paginationService: PaginationService,
    ) {}

    async list(query: any, request: Request) {
        return await this.paginationService.paginate(
            request,
            this.model,
            query,
            this.selectFields,
        );
    }

    async create(dto: CreateReviewDto) {
        const review = await this.ormService.review.create({
            data: {
                reviewer_id: dto.reviewer_id,
                reviewed_id: dto.reviewed_id,
                rating: dto.rating,
                comment: dto.comment,
                trip_id: dto.trip_id,
            },
            select: this.selectFields,
        });
        return review;
    }

    async findOne(id: number) {
        const review = await this.ormService.review.findFirst({
            where: {
                id,
            },
            select: this.selectFields,
        });
        if (!review) {
            throw new BadRequestException('Record Not Found');
        }
        return review;
    }

    async delete(id: number) {
        await this.findOne(id);
        return this.ormService.review.delete({
            where: {
                id,
            },
            select: this.selectFields,
        });
    }

    async findByTrip(id: number) {
        return await this.ormService.review.findFirst({
            where: {
                trip_id: id,
            },
            select: this.selectFields,
        });
    }
}
