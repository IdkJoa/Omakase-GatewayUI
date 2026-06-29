export type paramsGrid = Record<string, string | number | boolean | readonly string[]> & {
  page: string | number;
  pageSize: string | number;
  search?: string;
  verdict?: string;
  sourceIp?: string;
  serviceName?: string;
  from?: string;
  to?: string;
}
