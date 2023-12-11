import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { TripsService } from '../services/trips.service';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { User } from '@prisma/client';
import { Request } from 'express';

@Controller('trips')
export class TripsController {
    constructor(private readonly tripService: TripsService) {}
    @Get('')
    async get(@Query() query, @Req() req: Request) {
        const { type, ...rest } = query;
        return this.tripService.list(type, rest, req);
    }
    @Get(':id')
    async getOne(@Param('id') id: string) {
        return this.tripService.find(+id);
    }
    @Get('requests/:id')
    async getOneRequest(@Param('id') id: string) {
        return this.tripService.findRequest(+id);
    }

    @Get('driver/:id')
    async listByDriver(@Param('id') id: string, @Query() query) {
        return this.tripService.listByDriver(+id, query);
    }
    @Get('rider/:id')
    async listByRider(@Param('id') id: string, @Query() query) {
        return this.tripService.listByRider(+id, query);
    }

    @Get('unpaid')
    async getUnpaid(@AuthUser() user: User) {
        return this.tripService.findUnpaidTrips(user.id);
    }
}
