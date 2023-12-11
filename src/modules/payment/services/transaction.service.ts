import {
    forwardRef,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
} from '@nestjs/common';
import { Gateway, Transaction } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime';
import { Request } from 'express';
import { OrmService } from 'src/database/orm.service';
import { PaginationService } from 'src/database/pagination.service';
import { UsersService } from 'src/modules/users/users.service';
import { BalanceTransferDto } from '../dto/balance-transfer.dto';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { VerifyTransactionDto } from '../dto/verify-transaction.dto';
import { FlutterWaveGateway } from '../gateways/flutterwave.gateway';
import { PaystackGateway } from '../gateways/paystack.gateway';

@Injectable()
export class TransactionService {
    model: string = 'transaction';
    constructor(
        private readonly ormService: OrmService,
        private readonly paginationService: PaginationService,
        private readonly userService: UsersService,
        @Inject(forwardRef(() => PaystackGateway))
        private readonly paystackGateway: PaystackGateway,
        @Inject(forwardRef(() => FlutterWaveGateway))
        private readonly flutterwaveGateway: FlutterWaveGateway,
    ) {}

    async create(
        dto: {
            amount: number;
            currency: string;
            description: string;
            type?: 'credit' | 'debit';
            receiver_id: number;
            sender_id: number;
        },
        gateway: Gateway,
        reference: string,
    ) {
        const transaction = await this.ormService.transaction.create({
            data: {
                amount: dto.amount,
                currency: dto.currency,
                description: dto.description,
                status: 'pending',
                type: dto.type,
                user_id: dto.sender_id,
                gateway,
                reference,
            },
        });
        return transaction;
    }

    async list(query: any, request: Request) {
        return await this.paginationService.paginate(
            request,
            this.model,
            query,
            {
                id: true,
                type: true,
                description: true,
                amount: true,
                currency: true,
                status: true,
                gateway: true,
                reference: true,
                created_at: true,
                updated_at: true,
                receiver: {
                    select: {
                        first_name: true,
                        last_name: true,
                    },
                },
                sender: {
                    select: {
                        first_name: true,
                        last_name: true,
                    },
                },
            },
        );
    }

    async get(id: number) {
        const transaction = this.ormService.transaction.findUnique({
            where: {
                id,
            },
        });
        if (!transaction) {
            throw new HttpException(
                'Transaction not found',
                HttpStatus.NOT_FOUND,
            );
        }
        return transaction;
    }

    async findOneByReference(reference: string) {
        const transaction = this.ormService.transaction.findUnique({
            where: {
                reference,
            },
        });
        if (!transaction) {
            throw new HttpException(
                'Transaction not found',
                HttpStatus.NOT_FOUND,
            );
        }
        return transaction;
    }

    async listForUser(user_id: number) {
        return this.ormService.transaction.findMany({
            where: {
                user_id,
            },
            // select:{
            //     amount:true,
            //     currency:true,
            // }
        });
    }

    async update(id: number, dto: any) {
        await this.get(id);
        return this.ormService.transaction.update({
            where: {
                id,
            },
            data: {
                amount: dto.amount,
                currency: dto.currency,
                description: dto.description,
                status: dto.status,
                type: dto.type,
                user_id: dto.sender_id,
            },
        });
    }

    async verify(dto: VerifyTransactionDto) {
        const transaction = await this.findOneByReference(dto.reference);
        let verification: Transaction;
        switch (transaction.gateway) {
            case 'paystack':
                verification = await this.paystackGateway.verify(
                    transaction.reference,
                );
                break;
            case 'flutterwave':
                verification = await this.flutterwaveGateway.verify(
                    transaction.reference,
                );
            default:
                break;
        }

        return verification;
    }

    async transfer(dto: BalanceTransferDto) {
        throw new HttpException('Feature coming', HttpStatus.OK);

        const user = await this.userService.findOne(dto.user_id);

        if (user.account_balance.toFixed(2) < dto.amount.toFixed(2)) {
            throw new HttpException(
                'Insuffient balance',
                HttpStatus.BAD_REQUEST,
            );
        }
        let transfer: any;
        switch (dto.gateway) {
            case 'paystack':
                transfer = await this.paystackGateway.transfer(
                    user,
                    dto.amount,
                    dto.reason,
                );
                break;
            default:
                break;
        }
        return;
    }
}
