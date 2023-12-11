import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    Req,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { Permissions } from 'src/modules/auth/decorators/permission.decorator';
import CreateWithdrawalRequestDto from '../dto/create-withdrawal-request.dto';
import UpdateWithdrawalRequestDto from '../dto/update-withdrawal-request.dto';
import { WithdrawalRequestService } from '../services/withdrawal-request.service';

@Controller('payments/withdrawal-requests')
export class WithdrawalRequestController {
    constructor(
        private readonly withdrawalRequestService: WithdrawalRequestService,
    ) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @Permissions('browse-withdrawal-requests')
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
        return this.withdrawalRequestService.list(query, request);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Permissions('create-withdrawal-requests')
    async create(
        @Body() createWithdrawalRequestDto: CreateWithdrawalRequestDto,
        @Req() request,
    ) {
        const { sub, ..._ }: { sub: number; _: any } = request.user;
        return this.withdrawalRequestService.create(
            sub,
            createWithdrawalRequestDto,
        );
    }

    @Patch(':id')
    @HttpCode(HttpStatus.CREATED)
    @Permissions('update-withdrawal-requests')
    async update(
        @Param('id') id: string,
        @Body() updateWithdrawalRequestDto: UpdateWithdrawalRequestDto,
    ) {
        return this.withdrawalRequestService.update(
            updateWithdrawalRequestDto,
            +id,
        );
    }
}
