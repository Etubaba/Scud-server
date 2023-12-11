import { BadRequestException, Injectable } from '@nestjs/common';
import { OrmService } from 'src/database/orm.service';
import { QueryBag } from 'src/interfaces/query-bag.interface';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { permissions } from '../permissions';

@Injectable()
export class RolesService {
    selectFields = {
        id: true,
        name: true,
        permissions: {
            select: {
                permission: {
                    select: {
                        name: true,
                    },
                },
            },
        },
    };

    constructor(private ormService: OrmService) {}

    async create(dto: CreateRoleDto): Promise<object | any> {
        const role = await this.ormService.role.create({
            data: {
                name: dto.name,
                permissions: {
                    create: this.preparePermissionsQuery(dto.permissions),
                },
            },
        });
        if (!role) return null;
        return role;
    }

    async list() {
        const roles = await this.ormService.role.findMany({
            select: this.selectFields,
            orderBy: {
                created_at: 'desc',
            },
        });

        return roles.map((role) => {
            return {
                id: role.id,
                name: role.name,
                permisions: role.permissions.map((permission) => {
                    return permission.permission.name;
                }),
            };
        });
    }

    async findOne(id: any) {
        const role = await this.ormService.role.findUnique({
            where: {
                id: id,
            },
            select: this.selectFields,
        });
        if (!role) {
            throw new BadRequestException(`Record not found`);
        }

        const permissions = role.permissions.map((permission) => {
            return permission.permission.name;
        });

        delete role.permissions;

        return {
            ...role,
            permissions,
        };
    }

    async update(id: number, dto: UpdateRoleDto): Promise<any> {
        const role = await this.findOne(id);
        if (!role) {
            throw new BadRequestException(`Record not found`);
        }

        const existingPermissions = Object.values(permissions)
            .map((permission) => Object.values(permission))
            .flat();
        const uniquePermissions = dto.permissions.filter((permission) => {
            return (
                !role.permissions.includes(permission) &&
                existingPermissions.includes(permission)
            );
        });
        const permissionsQuery =
            uniquePermissions.length > 0
                ? { create: this.preparePermissionsQuery(uniquePermissions) }
                : {};

        const updatedRole = await this.ormService.role.update({
            where: {
                id: role.id,
            },
            data: {
                name: dto.name,
                permissions: permissionsQuery,
            },
            select: this.selectFields,
        });

        const permissionsObjects = updatedRole.permissions.map((permission) => {
            return permission.permission.name;
        });

        delete updatedRole.permissions;

        return {
            ...role,
            permissions: permissionsObjects,
        };
    }

    async remove(id: number) {
        const role = await this.findOne(id);
        if (!role) {
            throw new BadRequestException(`Record not found`);
        }
        return await this.ormService.role.delete({
            where: {
                id: id,
            },
        });
    }

    async findByName(name: string) {
        const role = await this.ormService.role.findUnique({
            where: {
                name: name,
            },
            select: this.selectFields,
        });
        if (!role) {
            return null;
        }
        const permissions = role.permissions.map((permission) => {
            return permission.permission.name;
        });

        delete role.permissions;

        return {
            ...role,
            permissions,
        };
    }

    async findMany(query: QueryBag): Promise<object | any> {
        return await this.ormService.role.findMany(query);
    }

    async createMany(query: any): Promise<any> {
        return await this.ormService.role.createMany(query);
    }

    async updateMany(query: any): Promise<any> {
        return await this.ormService.role.updateMany(query);
    }

    async deleteMany(query: any): Promise<any> {
        return await this.ormService.role.deleteMany(query);
    }

    preparePermissionsQuery(permissions: string[]) {
        const query = [];
        if (Array.isArray(permissions)) {
            permissions.forEach((permission) => {
                query.push({
                    permission: {
                        connect: {
                            name: permission,
                        },
                    },
                });
            });
        } else {
            query.push({
                permission: {
                    connect: {
                        name: permissions,
                    },
                },
            });
        }
        return query;
    }
}
