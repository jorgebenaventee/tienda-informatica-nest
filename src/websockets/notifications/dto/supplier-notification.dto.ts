export class SupplierNotificationDto {
  constructor(
    public id: string,
    public name: string,
    public contact: number,
    public address: string,
    public hired_at: Date,
    public category: string,
    public is_deleted: boolean,
    public products: string[],
  ) {}
}
