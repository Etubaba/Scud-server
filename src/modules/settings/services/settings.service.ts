import { settings } from './../settings';
import { UpdateManySettings } from './../dto/update-many-settings.dto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Setting } from '@prisma/client';
import { OrmService } from 'src/database/orm.service';
import { UpdateSettings } from '../dto/update-settings.dto';
import { settingsKey } from '../settings';
@Injectable()
export class SettingsService {
    get(key: settingsKey | string) {
        const setting = this.ormService.setting.findUnique({
            where: {
                key,
            },
            select: {
                key: true,
                value: true,
            },
        });
        if (!setting) {
            throw new HttpException(
                'Settings Not found',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
        return setting;
    }
    constructor(private readonly ormService: OrmService) {}

    async list(): Promise<Setting[]> {
        return await this.ormService.setting.findMany({
            select: {
                key: true,
                value: true,
                created_at: true,
                updated_at: true,
            },
        });
    }

    async update(dto: UpdateSettings): Promise<Setting> {
        return await this.ormService.setting.update({
            where: {
                key: dto.key,
            },
            data: {
                value: dto.value,
            },
        });
    }

    async updateMany(dto: UpdateManySettings) {
        const promises = dto.keys.map(async (key, index) => {
            const recordToUpdate = await this.ormService.setting.findUnique({
                where: {
                    key,
                },
            });

            if (recordToUpdate) {
                return this.ormService.setting.update({
                    where: {
                        key,
                    },
                    data: {
                        value: dto.values[index],
                    },
                });
            } else {
                return Promise.resolve(null);
            }
        });

        return Promise.all(promises);
    }
}
