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
import { SupportCategoriesService } from '../services/support-categories.service';
import { CreateSupportCategoryDto } from '../dtos/create-support-category.dto';
import { UpdateSupportCategoryDto } from '../dtos/update-support-category.dto';
import { Permissions } from 'src/modules/auth/decorators/permission.decorator';
import { Guest } from 'src/modules/auth/decorators/public.decorator';
import { BypassVerification } from 'src/modules/auth/decorators/bypass-verification.decorator';

@Controller('support-categories')
export class SupportCategoriesController {
    constructor(
        private readonly supportCategoriesService: SupportCategoriesService,
    ) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @Guest()
    @BypassVerification()
    list() {
        return this.supportCategoriesService.list();
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Permissions('create-support')
    create(@Body() data: CreateSupportCategoryDto) {
        return this.supportCategoriesService.create(data);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @Guest()
    @BypassVerification()
    findOne(@Param('id') id: string) {
        return this.supportCategoriesService.findOne(+id);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.CREATED)
    @Permissions('update-support')
    update(@Body() data: UpdateSupportCategoryDto, @Param('id') id: string) {
        return this.supportCategoriesService.update(+id, data);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @Permissions('delete-support')
    remove(@Param('id') id: string) {
        return this.supportCategoriesService.remove(+id);
    }
}
