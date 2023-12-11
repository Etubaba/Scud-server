import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { OrmService } from 'src/database/orm.service';

@Injectable()
export class BankService {
    model: string = 'bank';
    constructor(private readonly ormService: OrmService) {}

    async list() {
        return await this.ormService.bank.findMany({
            select: {
                id: true,
                name: true,
                code: true,
            },
        });
    }
}
