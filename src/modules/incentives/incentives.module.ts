import { Module } from '@nestjs/common';
import { IncentivesController } from './controllers/incentives.controller';
import { IncentivesService } from './services/incentives.service';

@Module({
    providers: [IncentivesService],
    controllers: [IncentivesController],
})
export class IncentivesModule {}
