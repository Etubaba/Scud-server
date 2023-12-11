import { Injectable } from '@nestjs/common';
import { OrmService } from 'src/database/orm.service';

@Injectable()
export class PermissionsService {
    constructor(private ormService: OrmService) {}

    async list() {
        const permissions = await this.ormService.permission.findMany({
            select: {
                name: true,
            },
        });

        return permissions.reduce(
            (acc, permission) => acc.concat(permission.name),
            [],
        );
    }
}
