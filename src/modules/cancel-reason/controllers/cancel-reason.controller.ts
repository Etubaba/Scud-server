import { Request } from 'express';
import {
    Body,
    Controller,
    Delete,
    Get,
    Req,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { Permissions } from 'src/modules/auth/decorators/permission.decorator';
import { CreateCancelReasonDto } from '../dto/create-cancel-reason.dto';
import { UpdateCancelReasonDto } from '../dto/update-cancel-reason.dto';
import { CancelReasonService } from '../services/cancel-reason.service';

@Controller('cancel-reasons')
export class CancelReasonController {
    constructor(private readonly cancelReasonService: CancelReasonService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    //all users should be able to fetch cancel reasons
    // @Permissions('browse-cancel-reasons')
    @ApiQuery({
        name: 'next_cursor',
    })
    @ApiQuery({
        name: 'sort',
    })
    @ApiQuery({
        name: 'direction',
    })
    @ApiQuery({
        name: 'filter',
    })
    list(@Query() query, @Req() request: Request) {
        return this.cancelReasonService.list(query, request);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @Permissions('read-cancel-reasons')
    find(@Param('id') id: string) {
        return this.cancelReasonService.findOne(+id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Permissions('create-cancel-reasons')
    create(@Body() createCancelReasonDto: CreateCancelReasonDto) {
        return this.cancelReasonService.create(createCancelReasonDto);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.CREATED)
    @Permissions('update-cancel-reasons')
    update(
        @Param('id') id: string,
        @Body() updateCancelReasonDto: UpdateCancelReasonDto,
    ) {
        return this.cancelReasonService.update(+id, updateCancelReasonDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @Permissions('delete-cancel-reasons')
    delete(@Param('id') id: string) {
        return this.cancelReasonService.remove(+id);
    }
}
