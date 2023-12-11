import { Request } from 'express';
import {
    Body,
    Controller,
    Delete,
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
import { Permissions } from 'src/modules/auth/decorators/permission.decorator';
import { CreateBankAccountDto } from '../dto/create-bank-account.dto';
import { UpdateBankAccountDto } from '../dto/update-bank-account.dto';
import { BankAccountService } from '../services/bank-account.service';

@Controller('payments/bank-accounts')
export class BankAccountController {
    constructor(private readonly bankAccountService: BankAccountService) {}

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
        return this.bankAccountService.list(query, request);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Permissions('create-bank-accounts')
    create(@Body() createBankAccountDto: CreateBankAccountDto) {
        return this.bankAccountService.create(createBankAccountDto);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @Permissions('read-bank-accounts')
    find(@Param('id') id: string) {
        return this.bankAccountService.findOne(+id);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.CREATED)
    @Permissions('update-bank-accounts')
    update(
        @Param('id') id: string,
        @Body() updateBankAccountDto: UpdateBankAccountDto,
    ) {
        return this.bankAccountService.update(updateBankAccountDto, +id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @Permissions('delete-bank-accounts')
    delete(@Param('id') id: string) {
        return this.bankAccountService.remove(+id);
    }
}
