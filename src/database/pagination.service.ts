import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import {
    PaginationQueryParams,
    PaginationResultInterface,
} from 'src/interfaces/pagination.interface';
import { SettingsService } from 'src/modules/settings/services/settings.service';
import { OrmService } from './orm.service';
import { settings } from 'src/modules/settings/settings';

@Injectable()
export class PaginationService {

    constructor(
        private settingsService: SettingsService,
        private ormService: OrmService,
        private readonly configService: ConfigService,
    ) { }

    /**
     * Prepares the pagination query parameters based on the provided input.
     * @param query - The query parameters for pagination.
     * @param select - The select parameters for the database query.
     * @returns A promise that resolves to the pagination query parameters.
     */
    private async preparePaginationQuery(query: any, select: any): Promise<PaginationQueryParams> {
        // Retrieve the page size setting
        const { value } = await this.settingsService.get('PAGE_SIZE');
        const PAGE_SIZE: number = Number(value || settings.PAGE_SIZE);
        const MAXIMUM_PAGE_SIZE: number = 10_000;
        const SORT_VALUES: string[] = [ 'asc', 'desc' ];
        const PAGE_DIRECTIONS: string[] = [ 'next', 'previous' ];

        // Destructure the query parameters
        let {
            next_cursor = null,
            sort = 'created_at,desc',
            direction = 'next',
            page_size = PAGE_SIZE,
            ...params
        } = query;

        // Validate the page size parameter
        if (isNaN(Number(page_size)) || Number(page_size) < 1) {
            throw new HttpException('page_size must be a valid number', HttpStatus.BAD_REQUEST);
        }

        // The page_size cannot exceed 10000
        if (isNaN(Number(page_size)) && Number(page_size) > MAXIMUM_PAGE_SIZE) {
            page_size = MAXIMUM_PAGE_SIZE
        }

        // Normalize and convert parameter values
        const normalizedParams = Object.entries(params).reduce((acc, [ key, value ]) => {
            if (!isNaN(Number(value)) && 
                (value as string).indexOf("+") !== 0
            ) {
                value = Number(value);
            }

            if ([ 'true', 'false' ].includes(value as string)) {
                value = value === 'true';
            }

            acc[ key ] = value;
            return acc;
        }, {});

        // Split the sort parameter into key and order
        const [ sortKey, sortOrder ] = sort.split(',');

        // Validate the sort order parameter
        if (!SORT_VALUES.includes(sortOrder)) {
            throw new HttpException(
                `Invalid sort value: ${sortOrder}. Allowed values are ${SORT_VALUES.join(', ')}.`,
                HttpStatus.BAD_REQUEST
            );
        }

        // Validate the sort key parameter
        if (!(sortKey in select)) {
            throw new HttpException(`Invalid sort key: ${sortKey}`, HttpStatus.BAD_REQUEST);
        }

        // Validate the direction parameter
        if (!PAGE_DIRECTIONS.includes(direction)) {
            throw new HttpException(
                `Invalid direction: ${direction}. Allowed values are ${PAGE_DIRECTIONS.join(', ')}.`,
                HttpStatus.BAD_REQUEST
            );
        }

        // Create the orderBy object
        const orderBy = { [ sortKey ]: sortOrder };

        // Return the pagination query parameters
        return {
            nextCursor: next_cursor,
            sort: orderBy,
            direction,
            filter: normalizedParams,
            pageSize: +page_size,
        };
    }



    /**
     * Paginates the records based on the provided query parameters.
     * @param request - The HTTP request object.
     * @param model - The model name for querying the database.
     * @param query - The query parameters for pagination.
     * @param select - The select parameters for the database query.
     * @returns A promise that resolves to the pagination result.
     */
    async paginate(
        request: Request,
        model: string,
        query: any,
        select: any
    ): Promise<PaginationResultInterface> {
        // Prepare pagination query parameters
        const params: PaginationQueryParams = await this.preparePaginationQuery(query, select);
        const { nextCursor, filter, sort, direction, pageSize } = params;

        // Retrieve cursor data or count records if next cursor is not provided
        const cursorData = nextCursor
            ? this.decodeCursor(nextCursor)
            : await this.getCursorData(model, filter, sort);

        // Determine the number of records to take and the skip value
        const recordsToTake = direction === 'previous' ? -pageSize : pageSize;
        const skip = cursorData.cursor !== null && direction === 'previous' ? 1 : 0;

        // Fetch the rows based on the pagination parameters
        const rows = await this.ormService[ model ].findMany({
            where: filter,
            skip,
            take: recordsToTake,
            cursor: cursorData.cursor !== null ? { id: cursorData.cursor } : undefined,
            orderBy: sort,
            select,
        });

        // Return an empty result if no rows are returned
        if (rows.length === 0) {
            return {
                data: rows,
                next_page: null,
                previous_page: null,
                total_records: 0,
                next_cursor: null,
                page_count: 0,
                page_size: 0,
            };
        }

        let encodedCursor = null;
        let nextPage = null;
        let previousPage = null;

        // Generate the encoded cursor and URLs for next and previous pages if applicable
        if (cursorData.recordsCount > pageSize) {
            const lastItem = rows[ rows.length - 1 ];
            cursorData.cursor = lastItem.id;
            cursorData.pageCount = direction == 'next' ? cursorData.pageCount + 1 : cursorData.pageCount - 1;
            encodedCursor = this.encodeCursor(cursorData);

            if (pageSize * cursorData.pageCount < cursorData.recordsCount) {
                nextPage = new URL(request.originalUrl, this.configService.get('app.full_url'));
                nextPage.searchParams.append('next_cursor', encodedCursor);
                nextPage.searchParams.append('direction', 'next');
            }
            if ((cursorData.recordsCount - (pageSize * cursorData.pageCount) > 0) && cursorData.pageCount > 1){
                previousPage = new URL(request.originalUrl, this.configService.get('app.full_url'));
                previousPage.searchParams.append('next_cursor', encodedCursor);
                previousPage.searchParams.append('direction', 'previous');
            }
        }

        // Return the pagination result
        return {
            data: rows,
            next_page: nextPage?.toString() || null,
            previous_page: previousPage?.toString() || null,
            total_records: cursorData.recordsCount,
            next_cursor: encodedCursor,
            page_count: cursorData.pageCount,
            page_size: Number(pageSize),
        };
    }

    /**
     * Retrieves the cursor data by counting the total records.
     * @param model - The model name for querying the database.
     * @param filter - The filter parameters for the database query.
     * @param sort - The sort parameters for the database query.
     * @returns The cursor data object.
     */
    private async getCursorData(model: string, filter: any, sort: any) {
        const recordsCount = await this.ormService[ model ].count({
            where: filter,
            orderBy: sort,
        });

        return {
            recordsCount,
            cursor: null,
            pageCount: 0,
        };
    }

    private decodeCursor(cursor: string) {
        return JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'));
    }

    private encodeCursor(cursor: object) {
        return Buffer.from(JSON.stringify(cursor)).toString('base64');
    }
}
