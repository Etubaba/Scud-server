import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Query,
    Req,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Request } from 'express';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { Permissions } from 'src/modules/auth/decorators/permission.decorator';
import { CreateReviewDto } from '../dtos/create-review.dto';
import { ReviewService } from '../services/review.service';

@Controller('reviews')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) {}

    @Get()
    @Permissions('browse-reviews')
    @HttpCode(HttpStatus.OK)
    @ApiQuery({
        name: 'next_cursor',
    })
    @ApiQuery({
        name: 'sort',
    })
    @ApiQuery({
        name: 'direction',
    })
    @ApiQuery({
        name: 'filter',
    })
    async list(@Query() query, @Req() request: Request) {
        return await this.reviewService.list(query, request);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreateReviewDto) {
        return this.reviewService.create(dto);
    }

    @Get(':id')
    @Permissions('read-reviews')
    @HttpCode(HttpStatus.OK)
    async get(@Param('id') id: string) {
        return this.reviewService.findOne(+id);
    }

    @Get('find/trip/:id')
    @Permissions('read-reviews')
    @HttpCode(HttpStatus.OK)
    async getForTrip(@Param('id') trip_id: string) {
        return await this.reviewService.findByTrip(+trip_id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @Permissions('delete-reviews')
    async delete(@Param('id') id: string) {
        return this.reviewService.delete(+id);
    }
}
