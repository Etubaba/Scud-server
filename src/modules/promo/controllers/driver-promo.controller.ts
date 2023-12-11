import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
} from '@nestjs/common';
import { CreateDriverPromoDto } from '../dto/create-driver-promo.dto';
import { UpdateDriverPromoDto } from '../dto/update-driver-promo.dto';
import { DriverPromoService } from '../services/driver-promo.service';
import { Permissions } from 'src/modules/auth/decorators/permission.decorator';
import { ParticipateDriverPromoDto } from '../dto/participate-driver-promo.dto';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { User } from '@prisma/client';

@Controller('driver-promos')
export class DriverPromoController {
    constructor(private readonly driverPromoService: DriverPromoService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @Permissions('browse-promos')
    list() {
        return this.driverPromoService.list();
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Permissions('create-promos')
    create(@Body() dto: CreateDriverPromoDto) {
        return this.driverPromoService.create(dto);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.CREATED)
    @Permissions('update-promos')
    update(@Param('id') id: string, @Body() dto: UpdateDriverPromoDto) {
        return this.driverPromoService.update(+id, dto);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @Permissions('read-promos')
    findOne(@Param('id') id: string) {
        return this.driverPromoService.findOne(+id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @Permissions('delete-promos')
    remove(@Param('id') id: string) {
        return this.driverPromoService.remove(+id);
    }

    @Post('participate')
    @HttpCode(HttpStatus.OK)
    participate(
        @Body() dto: ParticipateDriverPromoDto,
        @AuthUser() user: User
    ){
        return this.driverPromoService.participateInPromo(dto, user)
    }

    @Get('progress/:id')
    @HttpCode(HttpStatus.OK)
    @Permissions('read-promos')
    progress(
        @Param('id') id: string
    ){
        return this.driverPromoService.promoProgress(+id)
    }

    @Get('user-progress/:promo_id/:user_id')
    @HttpCode(HttpStatus.OK)
    // No permissions so users can view their progress too.
    userProgress(
        @Param('promo_id') promo_id: string,
        @Param('user_id') user_id: string
    ){
        return this.driverPromoService.computeDriverProgress(+user_id, +promo_id)
    }
}
