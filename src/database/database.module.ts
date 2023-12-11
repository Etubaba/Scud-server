import { Global, Module } from '@nestjs/common';
import { OrmService } from './orm.service';
import { PaginationService } from './pagination.service';

@Global()
@Module({
    providers: [OrmService, PaginationService],
    imports: [],
    exports: [OrmService, PaginationService],
})
export class DatabaseModule {}
