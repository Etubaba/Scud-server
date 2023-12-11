import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
} from '@nestjs/common';
import { Permissions } from 'src/modules/auth/decorators/permission.decorator';
import { AssignManagersDto } from '../dtos/assign-managers.dto';
import { SupervisorService } from '../services/supervisor.service';

@Controller('supervisors')
export class SupervisorController {
    constructor(private readonly supervisorService: SupervisorService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @Permissions('browse-supervisors')
    list() {
        return this.supervisorService.list();
    }

    @Post('assign')
    @HttpCode(HttpStatus.CREATED)
    @Permissions('update-supervisors')
    assign(@Body() dto: AssignManagersDto) {
        return this.supervisorService.assignManagers(dto);
    }
}
