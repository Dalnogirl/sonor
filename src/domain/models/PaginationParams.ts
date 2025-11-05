export class PaginationParams {
  private constructor(
    public readonly page: number,
    public readonly pageSize: number
  ) {}

  static create(page?: number, pageSize?: number): PaginationParams {
    const validPage = Math.max(1, page ?? 1);
    const validPageSize = Math.min(100, Math.max(1, pageSize ?? 10));

    return new PaginationParams(validPage, validPageSize);
  }

  get offset(): number {
    return (this.page - 1) * this.pageSize;
  }

  get limit(): number {
    return this.pageSize;
  }

  toPrisma(): { skip: number; take: number } {
    return {
      skip: this.offset,
      take: this.limit,
    };
  }
}
