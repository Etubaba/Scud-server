import { Module } from '@nestjs/common';
import { DriverPromoController } from './controllers/driver-promo.controller';
import { PromoController } from './controllers/promo.controller';
import { DriverPromoService } from './services/driver-promo.service';
import { PromoService } from './services/promo.service';

@Module({
    controllers: [PromoController, DriverPromoController],
    providers: [PromoService, DriverPromoService],
})
export class PromoModule {}
