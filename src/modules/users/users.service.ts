import {
    BadRequestException,
    forwardRef,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { OrmService } from 'src/database/orm.service';
import { RegisterDto } from '../auth/dto/register.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { OtpType, Prisma, User } from '@prisma/client';
import { VerificationService } from '../auth/services/verification.service';
import * as randomstring from 'randomstring';
import { QueryBag } from 'src/interfaces/query-bag.interface';
import { PaginationService } from 'src/database/pagination.service';
import { UpdateProfileDto } from '../auth/dto/update-profile.dto';
import { SettingsService } from '../settings/services/settings.service';
import { Request } from 'express';
import { RolesService } from '../auth/services/roles.service';
import { permissions } from '../auth/permissions';
import { MediaService } from '../media/media.service';
import { AccountManagerService } from '../account-manager/services/account-manager.service';
import { roles } from '../auth/roles';
import { VehicleTypeService } from '../vehicle/services/vehicle-type.service';
import * as moment from 'moment';
import { log } from 'console';

type UserAdditionalFields = {
    roles: string[];
    role: string;
    is_active: boolean;
};

@Injectable()
export class UsersService {
    model: string = 'user';
    userFields = {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        gender: true,
        address: true,
        email_verified: true,
        phone_verified: true,
        created_at: true,
        updated_at: true,
        provider: true,
        referral_code: true,
        last_login: true,
        max_pickup_distance: true,
        paystack_recipient_code: true,
        account_balance: true,
        credibility_score: true,
        picture: true,
        is_active: true,
        reviews: true,
        reviews_recieved: true,
        roles: {
            select: {
                role: {
                    select: {
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
                    },
                },
            },
        },
        state_id: true,
        state: {
            select: {
                name: true,
                id: true,
            },
        },
        account_managers: {
            select: {
                account_manager: {
                    include: {
                        state: {
                            select: {
                                name: true,
                                id: true,
                            },
                        },
                        drivers: {
                            select: {
                                driver: true,
                            },
                        },
                    },
                },
            },
        },
        drivers: {
            select: {
                driver: {
                    include: {
                        state: {
                            select: {
                                name: true,
                                id: true,
                            },
                        },
                    },
                },
            },
        },
        supervisor: {
            select: {
                supervisor: {
                    include: {
                        state: {
                            select: {
                                name: true,
                                id: true,
                            },
                        },
                    },
                },
            },
        },
        manager: {
            select: {
                manager: {
                    include: {
                        state: {
                            select: {
                                name: true,
                                id: true,
                            },
                        },
                    },
                },
            },
        },
        bank_account: true,
        license: true,
        vehicles: {
            include: {
                vehicle_brand: {
                    select: {
                        name: true,
                    },
                },
            },
        },
        trips: {
            include: {
                fare: true,
                trip_fare: true,
                review: true,
                driver: true,
                rider: true,
            },
        },
        vehicle_type_id: true,
    };
    constructor(
        private ormService: OrmService,
        @Inject(forwardRef(() => VerificationService))
        private verificationService: VerificationService,
        private readonly paginationService: PaginationService,
        private readonly settingService: SettingsService,
        private readonly rolesService: RolesService,
        private readonly mediaService: MediaService,
        @Inject(forwardRef(() => AccountManagerService))
        private readonly accountManagerService: AccountManagerService, // @Inject(forwardRef(() => VehicleTypeService)) // private readonly vehicleTypeService: VehicleTypeService,
    ) {}

    async create(dto: RegisterDto | CreateUserDto): Promise<object | any> {
        const code = await this.createReferralCode();

        const credibilityScore = await this.settingService.get(
            'DEFAULT_DRIVERS_CREDIBILITY_SCORE',
        );
        const maxPickupDistance = await this.settingService.get(
            'DEFAULT_DRIVERS_MAX_PICKUP_DISTANCE',
        );

        let userData = {
            first_name: dto.first_name,
            last_name: dto.last_name,
            referral_code: code,
            state_id: dto.state_id,
            email: dto.email,
            phone: dto.phone,
            gender: dto.gender,
            address: dto.address,
            provider: dto.provider,
            max_pickup_distance: +maxPickupDistance.value,
            credibility_score: +credibilityScore.value,
        };
        if (dto.hasOwnProperty('roles')) {
            userData['roles'] = {
                create: this.prepareUserQuery(dto['roles']),
            };
        }
        if (dto.hasOwnProperty('role')) {
            userData['roles'] = {
                create: this.prepareUserQuery(dto['role']),
            };
        }
        const user = this.cleanRolesAndPermissions(
            await this.ormService.user.create({
                data: userData,
                select: this.userFields,
            }),
        );
        if (!user) return null;

        const hasRoles = (user['roles'] as string[]).includes('driver');
        if (hasRoles) {
            await this.accountManagerService.assignToUser(user.id);
        }
        const { sent, message } = await this.verificationService.sendOtp(
            user.id,
            OtpType.register,
        );
        return {
            user,
            message,
        };
    }

    async list(query: any, request: Request) {
        let userFieldlist = this.userFields;
        // delete userFieldlist.roles

        const users = await this.paginationService.paginate(
            request,
            this.model,
            query,
            userFieldlist,
        );
        users['data'] = this.cleanMultipleUsersRolesAndPermissions(users.data);
        return users;
    }

    async findOne(id: any) {
        const user = await this.ormService.user.findUnique({
            where: {
                id: id,
            },
            select: this.userFields,
        });
        if (!user) {
            throw new BadRequestException(`Record not found`);
        }

        return this.cleanRolesAndPermissions(user);
    }

    async updateFields(id: number, data: any): Promise<any> {
        const user = await this.findOne(id);
        if (!user) {
            throw new BadRequestException(`Record not found`);
        }
        return await this.ormService.user.update({
            where: {
                id: user.id,
            },
            data: data,
            select: this.userFields,
        });
    }

    async update(
        id: number,
        dto: UpdateUserDto | UpdateProfileDto,
    ): Promise<User> {
        const user = await this.findOne(id);
        if (!user) {
            throw new HttpException(`Record not found`, HttpStatus.NOT_FOUND);
        }

        const {
            first_name,
            last_name,
            email,
            phone,
            gender,
            address,
            provider,
            state_id,
            max_pickup_distance,
        } = dto;
        const is_active = dto.hasOwnProperty('is_active')
            ? dto['is_active']
            : undefined;
        const roles = dto.hasOwnProperty('roles')
            ? dto['roles']
            : dto.hasOwnProperty('role')
            ? [dto['role']]
            : undefined;
        const email_verified =
            dto.hasOwnProperty('email') && user.email !== dto.email
                ? false
                : undefined;
        const phone_verified =
            dto.hasOwnProperty('phone') && user.phone !== dto.phone
                ? false
                : undefined;

        const userData: Prisma.UserUncheckedUpdateInput & {
            is_active: boolean;
        } = {
            first_name,
            last_name,
            email,
            phone,
            gender,
            address,
            provider,
            state_id,
            max_pickup_distance,
            is_active,
            email_verified,
            phone_verified,
            roles: roles ? { create: this.prepareUserQuery(roles) } : undefined,
        };

        if (dto.hasOwnProperty('vehicle_type_id')) {
            const can_change = await this.canSwitchToVehicleType(
                id,
                dto.vehicle_type_id,
            );
            if (can_change) {
                userData['vehicle_type_id'] = dto.vehicle_type_id;
            }
        }
        return this.cleanRolesAndPermissions(
            await this.ormService.user.update({
                where: { id: user.id },
                data: userData,
                select: this.userFields,
            }),
        );
    }

    async remove(id: number) {
        const user = await this.findOne(id);
        if (!user) {
            throw new BadRequestException(`Record not found`);
        }

        if (user.id === 1) {
            throw new HttpException(
                'User Cannot be deleted',
                HttpStatus.BAD_REQUEST,
            );
        }
        return await this.ormService.user.delete({
            where: {
                id: id,
            },
        });
    }

    async findByEmail(email: string): Promise<object | any> {
        const user = await this.ormService.user.findUnique({
            where: {
                email: email,
            },
            select: this.userFields,
        });
        if (!user) {
            return null;
        }
        return this.cleanRolesAndPermissions(user);
    }
    async findByPhone(phone: string): Promise<object | any> {
        const user = await this.ormService.user.findUnique({
            where: {
                phone: phone,
            },
            select: this.userFields,
        });

        if (!user) {
            return null;
        }

        return this.cleanRolesAndPermissions(user);
    }
    async hasRole(id: number, name: string) {
        const role = await this.rolesService.findByName(name);
        const user = await this.ormService.user.findFirst({
            where: {
                id: id,
                roles: {
                    some: {
                        role_id: role.id,
                    },
                },
            },
            select: this.userFields,
        });

        return Boolean(user);
    }
    async findMany(query: QueryBag): Promise<object | any> {
        return await this.ormService.user.findMany(query);
    }

    async findOneByQuery(query: QueryBag): Promise<object | any> {
        return await this.ormService.user.findFirst(query);
    }

    async selectRelated(
        conditions: object,
        select: object = {},
    ): Promise<object | any> {
        const query = {};
        if (conditions) {
            query['where'] = conditions;
        }

        if (select) {
            query['select'] = select;
        }

        return await this.ormService.user.findFirst(query);
    }

    async createMany(query: any): Promise<any> {
        return await this.ormService.user.createMany(query);
    }

    async updateMany(query: any): Promise<any> {
        return await this.ormService.user.updateMany(query);
    }

    async deleteMany(query: any): Promise<any> {
        return await this.ormService.user.deleteMany(query);
    }

    async uploadPhoto(id: number, image: Express.Multer.File) {
        const { url } = await this.mediaService.uploadImage(
            image,
            'images/users',
        );
        if (!url) {
            throw new HttpException(
                'Image upload failed',
                HttpStatus.NOT_MODIFIED,
            );
        }
        return this.cleanRolesAndPermissions(
            await this.updateFields(id, {
                picture: url,
            }),
        );
    }

    async hasPermissions(id: number, permissions: string[]): Promise<boolean> {
        const roleIds = [];
        const permissionIds = [];

        const permissionObjects = await this.ormService.permission.findMany({
            where: {
                name: { in: permissions },
            },
            select: {
                id: true,
            },
        });
        const user = await this.ormService.user.findUnique({
            where: {
                id: id,
            },
            select: {
                roles: {
                    select: {
                        role_id: true,
                        role: true,
                    },
                },
            },
        });

        if (user.roles.length == 0) {
            return false;
        }

        if (user.roles.some(({ role }) => role.name === roles.SUPER_ADMIN)) {
            return true;
        }

        user.roles.forEach((element) => roleIds.push(element.role_id));
        permissionObjects.forEach((element) => permissionIds.push(element.id));

        const userRolesPermissions = await this.ormService.role.findMany({
            where: {
                id: { in: roleIds },
            },
            select: {
                permissions: {
                    where: {
                        permission_id: { in: permissionIds },
                    },
                },
            },
        });
        const flatPermissions = userRolesPermissions
            .map(({ permissions }) => permissions)
            .filter((val) => val.length > 0);
        return flatPermissions.length > 0;
    }

    prepareUserQuery(roles: string[]) {
        const query = [];
        if (Array.isArray(roles)) {
            roles.forEach((role) => {
                query.push({
                    role: {
                        connect: {
                            name: role,
                        },
                    },
                });
            });
        } else {
            query.push({
                role: {
                    connect: {
                        name: roles,
                    },
                },
            });
        }
        return query;
    }
    async createReferralCode() {
        const code = randomstring.generate({
            capitalization: 'uppercase',
            readable: true,
            length: 10,
        });
        const exists = await this.ormService.user.findUnique({
            where: {
                referral_code: code,
            },
        });
        if (exists) {
            return this.createReferralCode();
        }
        return code;
    }

    cleanMultipleUsersRolesAndPermissions(users: any): User[] {
        return users.map((user: User) => this.cleanRolesAndPermissions(user));
    }

    cleanRolesAndPermissions(user: any): User {
        // If the user has no roles, return the user
        if (!user || !user.roles || !user.roles.length) {
            return user;
        }

        // Get the roles from the user
        const roles = user.roles.map((role) => {
            // If the role has no name return the role
            if (!role || !role.role || !role.role.name) {
                return role;
            }

            return role.role.name;
        });
        // Get the permissions from the role
        const permissions = user.roles
            .map((role) => {
                // If the role has no name or permissions, return the role
                if (
                    !role ||
                    !role.role ||
                    !role.role.name ||
                    !role.role.permissions ||
                    !role.role.permissions.length
                ) {
                    return;
                }

                return role.role.permissions.map(
                    (permission) => permission.permission.name,
                );
            })
            .filter((permission) => permission != null);

        // Delete the roles from the user
        delete user.roles;

        //This code associates the user with the roles and permissions
        return this.cleanAccountOfficers(
            Object.assign(user, {
                roles,
                permissions: permissions.reduce(
                    (acc, val) => acc.concat(val),
                    [],
                ),
            }),
        );
    }
    cleanAccountOfficers(user: any): User {
        if (!user || !user.manager || !user.manager.manager) {
            return user;
        }
        user['officer'] = user.manager.manager;
        delete user.manager;
        return user;
    }
    async driverCanBeOnline(id: number) {
        const user = await this.ormService.user.findFirst({
            where: {
                id,
                is_active: true,
                vehicles: {
                    every: {
                        verification: 'verified',
                    },
                },
                license: {
                    verification: 'verified',
                },
            },
        });
        if (!user) {
            return false;
        }
        return true;
    }

    async canSwitchToVehicleType(
        userId: number,
        vehicleTypeId: number,
    ): Promise<boolean> {
        const vehicleType = await this.ormService.vehicleType.findFirst({
            where: { id: vehicleTypeId },
            select: { minimum_year: true, maximum_year: true },
        });
        const user = await this.ormService.user.findUnique({
            where: { id: userId },
            select: { vehicles: { select: { manufacture_date: true } } },
        });
        const vehicle = user?.vehicles[0];
        if (!vehicle || !vehicleType) return false;
        const endDate = vehicleType.minimum_year;
        return moment(vehicle.manufacture_date).isSameOrAfter(
            moment(endDate),
            'year',
        );
    }
}
