export interface PaginationResultInterface {
    data: any[];
    next_page: string | null;
    previous_page: string | null;
    total_records: number;
    next_cursor: string;
    page_count: number;
    page_size: number;
}

export interface PaginationQueryParams {
    nextCursor: string;
    filter: object;
    sort: object;
    direction: string;
    pageSize: number
}

export interface PaginationBuilder {
    model: string;

    direction: string;
}
