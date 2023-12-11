import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { WithdrawalStatus } from '@prisma/client';
import { Request } from 'express';
import * as moment from 'moment';
import { OrmService } from 'src/database/orm.service';
import { PaginationService } from 'src/database/pagination.service';
import { RolesService } from 'src/modules/auth/services/roles.service';
import { SettingsService } from 'src/modules/settings/services/settings.service';
import CreateWithdrawalRequestDto from '../dto/create-withdrawal-request.dto';
import UpdateWithdrawalRequestDto from '../dto/update-withdrawal-request.dto';
import { TripsService } from 'src/modules/rides/services/trips.service';

@Injectable()
export class WithdrawalRequestService {
    model: string = 'withdrawalRequests';

    constructor(
        private readonly ormService: OrmService,
        private readonly paginationService: PaginationService,
        private readonly settingService: SettingsService,
        private readonly roleService: RolesService,
        private readonly tripService: TripsService,
    ) {}

    async list(query: any, request: Request) {
        const result = await this.paginationService.paginate(
            request,
            this.model,
            query,
            {
                id: true,
                amount: true,
                status: true,
                user: {
                    include: {
                        trips: true,
                        trips_taken: true,
                    },
                },
                created_at: true,
                updated_at: true,
            },
        );
        result.data.forEach(async (value, index) => {
            const unpaid = await this.tripService.findUnpaidTrips(
                value.user.id,
            );
            result.data[index]['unpaid'] = unpaid;
        });
        return result;
    }

    async findOne(id: number) {
        const withdrawalRequest =
            await this.ormService.withdrawalRequests.findUnique({
                where: { id },
                include: { user: true },
            });

        if (!withdrawalRequest) {
            throw new HttpException('Record not found', HttpStatus.NOT_FOUND);
        }
        const unpaid = await this.tripService.findUnpaidTrips(
            withdrawalRequest.user.id,
        );
        return { withdrawalRequest, unpaid };
    }

    async update(dto: UpdateWithdrawalRequestDto, id: number) {
        await this.findOne(id);

        if (dto.status === 'approved') {
            // RUNS CODE THAT CREDITS USER
        }

        return await this.ormService.withdrawalRequests.update({
            where: { id },
            data: {
                status: dto.status,
            },
        });
    }

    /**
     * It checks if the user is a driver, if the user has a bank account, if the user has a pending
     * withdrawal request, if the withdrawal amount is within the minimum and maximum withdrawal
     * amount, and if the user has sufficient account balance
     * @param {number} user_id - The user id of the user making the withdrawal request
     * @param {number} amount - The amount to be withdrawn
     */
    async withdrawalConstraints(user_id: number, amount: number) {
        const driverRole = await this.roleService.findByName('driver');

        const user = await this.ormService.user.findFirst({
            where: {
                id: user_id,
                roles: {
                    some: {
                        role_id: driverRole.id,
                    },
                },
            },
        });

        if (!user) {
            throw new HttpException('Record not found', HttpStatus.NOT_FOUND);
        }

        const bankAccountExists = await this.ormService.bankAccount.findFirst({
            where: { user_id },
        });

        if (!bankAccountExists) {
            throw new HttpException(
                'User has no bank account',
                HttpStatus.BAD_REQUEST,
            );
        }

        if (moment(moment()).diff(bankAccountExists.updated_at, 'hours') < 24) {
            throw new HttpException(
                "Withdrawal can't be processed at the moment",
                HttpStatus.CONFLICT,
            );
        }

        const existingWithdrawal =
            await this.ormService.withdrawalRequests.findFirst({
                where: {
                    user_id: user_id,
                    status: WithdrawalStatus.pending,
                },
            });

        if (existingWithdrawal) {
            throw new HttpException(
                'A submitted request is currently under review',
                HttpStatus.CONFLICT,
            );
        }

        const minAmount = parseFloat(
            (await this.settingService.get('MINIMUM_WITHDRAWAL_AMOUNT')).value,
        );
        const maxAmount = parseFloat(
            (await this.settingService.get('MAXIMUM_WITHDRAWAL_AMOUNT')).value,
        );

        if (amount > maxAmount || amount < minAmount) {
            throw new HttpException(
                `Withdrawal amount should be in between ${minAmount} and ${maxAmount}`,
                HttpStatus.BAD_REQUEST,
            );
        }

        if (Number(user.account_balance) < amount) {
            throw new HttpException(
                'Insufficient account balance',
                HttpStatus.CONFLICT,
            );
        }
    }

    async create(user_id: number, dto: CreateWithdrawalRequestDto) {
        await this.withdrawalConstraints(user_id, dto.amount);

        return await this.ormService.withdrawalRequests.create({
            data: {
                user_id: user_id,
                amount: dto.amount,
            },
        });
    }
}
