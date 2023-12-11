import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Query,
    Req,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { BypassVerification } from 'src/modules/auth/decorators/bypass-verification.decorator';
import { Permissions } from 'src/modules/auth/decorators/permission.decorator';
import { BalanceTransferDto } from '../dto/balance-transfer.dto';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { VerifyTransactionDto } from '../dto/verify-transaction.dto';
import { GatewayService } from '../services/gateway/gateway.service';
import { TransactionService } from '../services/transaction.service';

@Controller('transactions')
export class TransactionController {
    constructor(
        private readonly gatewayService: GatewayService,
        private readonly transactionService: TransactionService,
    ) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @Permissions('browse-bank-accounts')
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
    list(@Query() query, @Req() request: Request) {
        return this.transactionService.list(query, request);
    }

    @Post('init')
    @BypassVerification()
    init(@Body() body: CreateTransactionDto) {
        return this.gatewayService.initTransaction(body);
    }

    @Post('verify')
    verify(@Body() dto: VerifyTransactionDto) {
        return this.transactionService.verify(dto);
    }

    @Post('transfer')
    transfer(@Body() dto: BalanceTransferDto) {
        return this.transactionService.transfer(dto);
    }
}
