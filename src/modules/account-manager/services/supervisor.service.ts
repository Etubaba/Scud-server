import {
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { OrmService } from 'src/database/orm.service';
import { roles } from 'src/modules/auth/roles';
import { RolesService } from 'src/modules/auth/services/roles.service';
import { UsersService } from 'src/modules/users/users.service';
import { AssignManagersDto } from '../dtos/assign-managers.dto';

@Injectable()
export class SupervisorService {
    constructor(
        private readonly ormService: OrmService,
        private readonly roleService: RolesService,
        private readonly userService: UsersService,
    ) {}

    async list(): Promise<User[]> {
        const role = await this.roleService.findByName(roles.SUPERVISOR);

        const supervisors = await this.userService.findMany({
            where: {
                roles: {
                    some: {
                        role_id: role.id,
                    },
                },
            },
            include: {
                account_managers: {
                    select: {
                        account_manager: true,
                    },
                },
            },
        });

        return supervisors.map((supervisor) => {
            return {
                ...supervisor,
                account_managers: supervisor.account_managers.map(
                    (am) => am.account_manager,
                ),
            };
        });
    }

    async findOne(supervisor_id: number) {
        const role = await this.roleService.findByName(roles.SUPERVISOR);

        const supervisor = await this.userService.findOneByQuery({
            where: {
                id: supervisor_id,
                roles: {
                    some: {
                        role_id: role.id,
                    },
                },
            },
        });

        if (!supervisor) {
            throw new HttpException(
                'Supervisor not found',
                HttpStatus.NOT_FOUND,
            );
        }

        return supervisor;
    }

    private async assign(users: User[], supervisor_id: number) {
        const promises = users.map((user) =>
            this.ormService.supervisor.upsert({
                where: {
                    manager_id: user.id,
                },
                create: {
                    supervisor_id: supervisor_id,
                    manager_id: user.id,
                },
                update: {
                    supervisor_id: supervisor_id,
                },
            }),
        );
        return Promise.all(promises);
    }

    async assignManagers(dto: AssignManagersDto) {
        await this.findOne(dto.supervisor_id);

        const role = await this.roleService.findByName(roles.ACCOUNT_OFFICER);

        const query = {
            where: {
                roles: {
                    some: {
                        role_id: role.id,
                    },
                },
            },
        };

        if (dto.account_managers && dto.account_managers.length) {
            query.where['id'] = {
                in: dto.account_managers,
            };
        }

        const users: User[] = await this.userService.findMany(query);

        if (users.length === 0) {
            throw new HttpException('Record not found', HttpStatus.NOT_FOUND);
        }

        return await this.assign(users, dto.supervisor_id);
    }
}
