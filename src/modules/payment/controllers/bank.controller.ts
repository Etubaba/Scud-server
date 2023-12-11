import { Request } from 'express';
import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { BankService } from '../services/bank.service';

@Controller('payments/banks')
export class BankController {
    constructor(private readonly bankService: BankService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    async list() {
        return await this.bankService.list();
    }
}
