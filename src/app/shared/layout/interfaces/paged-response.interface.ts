export interface PagedResponse<T> {
  page: number;
  pageSize: number;
  totalRecords: number;
  data: T[];
}
