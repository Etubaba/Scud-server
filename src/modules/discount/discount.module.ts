import { Module } from '@nestjs/common';
import { DiscountService } from './services/discount.service';
import { DiscountController } from './controllers/discount.controller';
import { LocationModule } from '../location/location.module';

@Module({
    imports: [LocationModule],
    providers: [DiscountService],
    controllers: [DiscountController],
})
export class DiscountModule {}
