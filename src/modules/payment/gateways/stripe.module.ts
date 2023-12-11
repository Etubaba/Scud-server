import { DynamicModule, Module, Provider } from '@nestjs/common';
import { STRIPE_PROVIDER } from 'src/common/constants/constants';
import { OrmService } from 'src/database/orm.service';
import { SettingsService } from 'src/modules/settings/services/settings.service';
import { SettingsModule } from 'src/modules/settings/settings.module';
import { Stripe } from 'stripe';

@Module({})
export class StripeModule {
    static async initKeys() {
        try {
            const settingsService = new SettingsService(new OrmService());
            const [secretKey, publicKey] = await Promise.all([
                settingsService.get('STRIPE_SECRET_KEY'),
                settingsService.get('STRIPE_PUBLIC_KEY'),
            ]);

            return { secretKey: secretKey.value, publicKey: publicKey.value };
        } catch (e) {
            //console.error(e)
        }
    }
    static async forRoot(config: Stripe.StripeConfig): Promise<DynamicModule> {
        const { secretKey } = await StripeModule.initKeys();
        const stripe = new Stripe(secretKey, config);
        const StripeProvider: Provider = {
            provide: STRIPE_PROVIDER,
            useValue: stripe,
        };
        return {
            imports: [SettingsModule],
            providers: [StripeProvider],
            module: StripeModule,
            exports: [StripeProvider],
            global: true,
        };
    }
}
