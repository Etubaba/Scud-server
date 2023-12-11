import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { OrmService } from 'src/database/orm.service';
import { SendNotificationDto } from '../dto/send-notification.dto';
import { MailService } from 'src/modules/notifications/services/mail.service';
import { SmsService } from 'src/modules/notifications/services/sms.service';
import { SendPartialNotificationDto } from '../dto/send-partail-notification.dto';
import { Channel, Role } from '@prisma/client';
import { SendRoleNotificationDto } from '../dto/send-roles-notification.dto';
import { SettingsService } from 'src/modules/settings/services/settings.service';
import * as moment from 'moment';
import { CronService } from 'src/modules/cron/services/cron.service';
import { UserNotifiable } from 'src/interfaces/user-notifiable.interface';
import { UsersService } from 'src/modules/users/users.service';
import { RolesService } from 'src/modules/auth/services/roles.service';
import { CreateNotification } from 'src/interfaces/create-notification.interface';
import { IsEmail } from 'class-validator';
import { roles } from 'src/modules/auth/roles';
import { PaginationService } from 'src/database/pagination.service';
import { Request } from 'express';
import { readFileSync } from 'fs';
import { compile } from 'handlebars';
import { join } from 'path';
import { OweNotificationSettingsService } from 'src/modules/settings/services/owe-notification-settings.service';

@Injectable()
export class NotificationService {
    model: string = 'notification';
    constructor(
        private readonly ormService: OrmService,
        private readonly mailService: MailService,
        private readonly smsService: SmsService,
        private readonly settingsService: SettingsService,
        private readonly cronService: CronService,
        private readonly usersService: UsersService,
        private readonly rolesService: RolesService,
        private readonly paginationService: PaginationService,
        private readonly oweNotificationSettingsService: OweNotificationSettingsService,
    ) {}

    /*
    Notification Utilities
    */
    async send(
        channel: Channel,
        users: UserNotifiable[],
        subject: string,
        body: string,
        tags: string[],
    ) {
        const userIds = users.map((user) => ({ user_id: user.id }));
        const notificationChannels = {
            mail: async () => {
                try {
                    const emails = users
                        .map((user) => user.email)
                        .filter((email) => email !== null);
                    return await this.mailService.sendMany(
                        emails,
                        subject,
                        body,
                    );
                } catch (error) {
                    console.log(error);
                }
            },
            sms: async () => {
                try {
                    const phoneNumbers = users
                        .map((user) => user.phone)
                        .filter((phone) => phone !== null);
                    return await this.smsService.sendMany(phoneNumbers, body);
                } catch (error) {
                    console.log(error);
                }
            },
        };
        const invocable = notificationChannels[channel];
        if (invocable) {
            await invocable();
            try {
                return await this.create({
                    subject,
                    body,
                    channel,
                    tags,
                    users: userIds,
                });
            } catch (error) {
                console.log(error);
            }
        }
        throw new HttpException('Invalid Channel', HttpStatus.BAD_REQUEST);
    }

    async sendNotification(
        channel: Channel,
        users: UserNotifiable[],
        subject: string,
        body: string,
        tags: string[],
        schedule?: string,
    ) {
        if (schedule) {
            const date = moment(schedule);
            if (date.isSameOrBefore(moment().format())) {
                throw new HttpException(
                    'Schedule is in the past',
                    HttpStatus.BAD_REQUEST,
                );
            }
            try {
                const name = `mail-sending-on-${date.format('MM-DD-YYYY')}`;
                this.cronService.addJob(name, date.toDate(), () =>
                    this.send(channel, users, subject, body, tags),
                );
                return {
                    success: true,
                    message: 'Notification queued',
                };
            } catch (error) {
                console.error(error);
            }
        } else {
            return await this.send(channel, users, subject, body, tags);
        }
    }

    /*
    Notification helpers
    */
    async sendToAllUsers(dto: SendNotificationDto) {
        const users = await this.usersService.findMany({
            select: {
                id: true,
                email: true,
                phone: true,
            },
        });
        return await this.sendNotification(
            dto.channel,
            users,
            dto.subject,
            dto.body,
            ['All users'],
            dto.schedule,
        );
    }

    async sendToSpecificUsers(dto: SendPartialNotificationDto) {
        const usersQueryOperation = {
            mail: async () => {
                try {
                    const validEMails = dto.emails.filter((email) =>
                        IsEmail(email),
                    );
                    return await this.usersService.findMany({
                        where: {
                            email: {
                                in: validEMails,
                            },
                        },
                    });
                } catch (error) {
                    console.log(error);
                }
            },
            sms: async () => {
                try {
                    return await this.usersService.findMany({
                        where: {
                            phone: {
                                in: dto.phone_numbers,
                            },
                        },
                    });
                } catch (error) {
                    console.log(error);
                }
            },
        };
        let queryUsers = usersQueryOperation[dto.channel];
        const users = await queryUsers();
        const tags = ['To specific users'];
        return this.sendNotification(
            dto.channel,
            users,
            dto.subject,
            dto.body,
            tags,
            dto.schedule,
        );
    }

    async sendToUsersWithRole(dto: SendRoleNotificationDto) {
        const validRoles = dto.roles.filter((role) =>
            Object.values(roles).includes(role),
        );
        const rolesId = (
            await this.rolesService.findMany({
                where: {
                    name: {
                        in: validRoles,
                    },
                },
            })
        ).map((role) => role.id);
        const users = await this.usersService.findMany({
            where: {
                roles: {
                    some: {
                        role_id: {
                            in: rolesId,
                        },
                    },
                },
            },
        });
        return this.sendNotification(
            dto.channel,
            users,
            dto.subject,
            dto.body,
            ['To users with roles: ' + dto.roles.join(', ')],
            dto.schedule,
        );
    }

    async sendToInactiveUsers(dto: SendNotificationDto) {
        const waitTime = parseInt(
            (await this.settingsService.get('INACTIVE_USER_WAIT')).value,
        );
        const users = await this.usersService.findMany({
            where: {
                last_login: {
                    lte: moment().add(waitTime, 'week').format(),
                },
            },
        });
        return this.sendNotification(
            dto.channel,
            users,
            dto.subject,
            dto.body,
            ['To all inactive users'],
        );
    }

    async sendToInactiveUsersWithRoles(dto: SendRoleNotificationDto) {
        const waitTime = parseInt(
            (await this.settingsService.get('INACTIVE_USER_WAIT')).value,
        );
        const rolesId = (
            await this.rolesService.findMany({
                where: {
                    name: {
                        in: dto.roles,
                    },
                },
            })
        ).map((role) => role.id);

        const users = await this.usersService.findMany({
            where: {
                roles: {
                    some: {
                        role_id: {
                            in: rolesId,
                        },
                    },
                },
                last_login: {
                    lte: moment().add(waitTime, 'week').format(),
                },
            },
        });
        return this.sendNotification(
            dto.channel,
            users,
            dto.subject,
            dto.body,
            ['To all inactive users with roles: ' + dto.roles.join(', ')],
        );
    }

    /*
    CRUD Operations
    */
    async list(query: any, request: Request) {
        return await this.paginationService.paginate(
            request,
            this.model,
            query,
            {
                id: true,
                subject: true,
                body: true,
                channel: true,
                tags: true,
                users: {
                    select: {
                        user_id: true,
                        notification_id: true,
                        status: true,
                        retry_count: true,
                    },
                },
                created_at: true,
                updated_at: true,
            },
        );
    }

    async create(dto: CreateNotification) {
        return await this.ormService.notification.create({
            data: {
                subject: dto.subject,
                body: dto.body,
                channel: dto.channel,
                tags: dto.tags,
                users: {
                    createMany: {
                        data: dto.users,
                    },
                },
            },
            select: {
                subject: true,
                body: true,
                channel: true,
                tags: true,
                users: true,
                created_at: true,
                updated_at: true,
            },
        });
    }

    async find(id: number) {
        const notification = this.ormService.notification.findFirst({
            where: {
                id,
            },
            select: {
                id: true,
                subject: true,
                body: true,
                channel: true,
                tags: true,
                users: {
                    select: {
                        status: true,
                        retry_count: true,
                        user: true,
                    },
                },
                created_at: true,
                updated_at: true,
            },
        });
        if (!notification) {
            throw new HttpException('Record not found', HttpStatus.NOT_FOUND);
        }
        return notification;
    }
    async delete(id: number) {
        await this.find(id);
        return this.ormService.notification.delete({
            where: {
                id,
            },
        });
    }

    async warn(userid: number) {
        try {
            const user = await this.usersService.findOne(userid);

            if (user.account_balance.isPositive()) {
                return false;
            }

            const [{ value: min }, { value: max }, { value: percentage }] =
                await Promise.all([
                    this.settingsService.get('MINIMUM_OWED_AMOUNT'),
                    this.settingsService.get('MAXIMUM_OWED_AMOUNT'),
                    this.settingsService.get('PERCENTAGE_FOR_SECOND_OWE_MAIL'),
                ]);
            const mid = (parseInt(percentage) / 100) * parseInt(max);
            const owe_amount = user.account_balance.absoluteValue().toNumber();

            const [first_message, second_message, final_message] =
                await Promise.all([
                    this.oweNotificationSettingsService.getMessage('FIRST'),
                    this.oweNotificationSettingsService.getMessage('SECOND'),
                    this.oweNotificationSettingsService.getMessage('LAST'),
                ]);

            if (owe_amount >= parseInt(min) && owe_amount < mid) {
                const body = first_message.body.rawstring
                    ? first_message.body.rawstring
                    : compile(
                          readFileSync(
                              join(
                                  process.cwd(),
                                  `./src/mail-templates/${first_message.body.template}`,
                              ),
                              'utf8',
                          ),
                      )({});
                this.sendNotification(
                    'mail',
                    [user],
                    first_message.subject,
                    body,
                    ['owe notification'],
                );
                return true;
            }
            if (owe_amount >= mid && owe_amount < parseInt(max)) {
                const body = second_message.body.rawstring
                    ? second_message.body.rawstring
                    : compile(
                          readFileSync(
                              join(
                                  process.cwd(),
                                  `./src/mail-templates/${second_message.body.template}`,
                              ),
                              'utf8',
                          ),
                      )({});
                this.sendNotification(
                    'mail',
                    [user],
                    second_message.subject,
                    body,
                    ['owe notification'],
                );
                return true;
            }
            if (owe_amount >= parseInt(max)) {
                const body = final_message.body.rawstring
                    ? final_message.body.rawstring
                    : compile(
                          readFileSync(
                              join(
                                  process.cwd(),
                                  `./src/mail-templates/${final_message.body.template}`,
                              ),
                              'utf8',
                          ),
                      )({});
                this.sendNotification(
                    'mail',
                    [user],
                    final_message.subject,
                    body,
                    ['owe notification'],
                );
                return true;
            }
        } catch (e: unknown) {
            // if(e instanceof BadRequestException){
            //     return null
            // }
            console.log(e);
            return null;
        }
    }
}
