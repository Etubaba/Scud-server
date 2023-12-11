import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { OrmService } from 'src/database/orm.service';
import { roles } from 'src/modules/auth/roles';
import { RolesService } from 'src/modules/auth/services/roles.service';

@Injectable()
export class StatsService {
    constructor(
        private readonly orm: OrmService,
        private readonly roles: RolesService,
    ) {}

    async count({
        roleName,
        status,
    }: { roleName?: string; status?: boolean } = {}) {
        const role = roleName ? await this.roles.findByName(roleName) : null;

        const where = {
            roles: role ? { some: { role_id: role.id } } : undefined,
            is_active: status,
        };

        return await this.orm.user.count({ where });
    }

    async list() {
        const [
            total_riders,
            total_drivers,
            total_admins,
            total_account_officer,
            active_drivers,
            inactive_drivers,
            active_riders,
            inactive_riders,
        ] = await Promise.all([
            this.count({ roleName: roles.RIDER }),
            this.count({ roleName: roles.DRIVER }),
            this.count({ roleName: roles.ADMIN }),
            this.count({ roleName: roles.ACCOUNT_OFFICER }),
            this.count({ roleName: roles.DRIVER, status: true }),
            this.count({ roleName: roles.DRIVER, status: false }),
            this.count({ roleName: roles.RIDER, status: true }),
            this.count({ roleName: roles.RIDER, status: false }),
        ]);

        return {
            total_riders,
            total_drivers,
            total_admins,
            total_account_officer,
            active_drivers,
            inactive_drivers,
            active_riders,
            inactive_riders,
        };
    }
}
