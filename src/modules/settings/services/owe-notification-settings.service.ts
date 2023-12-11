import { Injectable } from '@nestjs/common';
import {
    MailField,
    UpdateOweNotification,
} from '../dto/update-owe-notification.dto';
import { SettingsService } from './settings.service';

@Injectable()
export class OweNotificationSettingsService {
    constructor(private readonly settingsService: SettingsService) {}

    async update(dto: UpdateOweNotification) {
        await this.settingsService.update({
            key: 'MAXIMUM_OWED_AMOUNT',
            value: `${dto.max_owe_amount}`,
        });
        await this.settingsService.update({
            key: 'MINIMUM_OWED_AMOUNT',
            value: `${dto.min_owe_amount}`,
        });
        await this.settingsService.update({
            key: 'PERCENTAGE_FOR_SECOND_OWE_MAIL',
            value: `${dto.percentage}`,
        });
        await this.saveMessage(dto.first, 'FIRST');
        await this.saveMessage(dto.second, 'SECOND');
        await this.saveMessage(dto.third, 'LAST');
        return { success: true };
    }
    async list() {
        const all = await Promise.all([
            this.getMessage('FIRST'),
            this.getMessage('SECOND'),
            this.getMessage('LAST'),
        ]);
        return all;
    }

    private async saveMessage(
        mail: MailField,
        prefix: 'FIRST' | 'SECOND' | 'LAST',
    ) {
        const subject = prefix + '_OWE_MAIL_SUBJECT';

        const body = prefix + '_OWE_MAIL_BODY';

        await this.settingsService.update({
            key: subject,
            value: mail.subject,
        });

        const jsonstring = JSON.stringify({
            template: mail.template,
            rawstring: mail.body,
        });

        await this.settingsService.update({
            key: body,
            value: jsonstring,
        });
    }

    async getMessage(prefix: 'FIRST' | 'SECOND' | 'LAST') {
        const subject = (
            await this.settingsService.get(prefix + '_OWE_MAIL_SUBJECT')
        ).value;

        const body = (await this.settingsService.get(prefix + '_OWE_MAIL_BODY'))
            .value;

        const bodyjson = JSON.parse(body) as {
            template: string | undefined;
            rawstring: string | undefined;
        };

        return {
            subject,
            body: bodyjson,
        };
    }
}
