import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { OrmService } from 'src/database/orm.service';
import { PaginationService } from 'src/database/pagination.service';
import { CreateBankAccountDto } from '../dto/create-bank-account.dto';
import { UpdateBankAccountDto } from '../dto/update-bank-account.dto';

@Injectable()
export class BankAccountService {
    model: string = 'bankAccount';
    selectFields = {
        id: true,
        account_name: true,
        account_number: true,
        user: {
            select: {
                id: true,
                first_name: true,
                last_name: true,
            },
        },
        bank: {
            select: {
                name: true,
                code: true,
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
            {
                id: true,
                account_name: true,
                account_number: true,
                user_id: true,
                created_at: true,
                updated_at: true,
                bank: {
                    select: {
                        name: true,
                        code: true,
                    },
                },
            },
        );
    }

    async create(dto: CreateBankAccountDto) {
        const exists = await this.ormService.bankAccount.findFirst({
            where: {
                user_id: +dto.user_id,
            },
        });
        if (exists) {
            throw new HttpException(
                'Bank account already exists for this user',
                HttpStatus.CONFLICT,
            );
        }
        return await this.ormService.bankAccount.create({
            data: {
                user_id: +dto.user_id,
                account_name: dto.account_name,
                account_number: dto.account_number,
                bank_id: +dto.bank_id,
            },
            select: this.selectFields,
        });
    }

    async update(dto: UpdateBankAccountDto, id: number) {
        await this.findOne(id);

        const account = await this.ormService.bankAccount.update({
            where: {
                id: id,
            },
            data: {
                account_name: dto.account_name,
                account_number: dto.account_number,
            },
            select: this.selectFields,
        });
        return account;
    }

    async findOne(id: number) {
        const account = await this.ormService.bankAccount.findUnique({
            where: {
                id: id,
            },
            select: this.selectFields,
        });

        if (!account) {
            throw new HttpException('Record not found', HttpStatus.NOT_FOUND);
        }
        return account;
    }

    async getByUser(user_id: number) {
        return await this.ormService.bankAccount.findFirst({
            where: {
                user_id,
            },
            select: {
                account_name: true,
                account_number: true,
                bank: {
                    select: {
                        name: true,
                        code: true,
                    },
                },
            },
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        return await this.ormService.bankAccount.delete({
            where: {
                id: id,
            },
        });
    }
}
