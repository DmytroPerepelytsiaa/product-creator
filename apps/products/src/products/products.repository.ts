import { Inject, Injectable } from "@nestjs/common";
import { count, desc, eq } from "drizzle-orm";

import { type Database, DRIZZLE } from "../database/database.tokens";
import { type ProductRow, products } from "../database/schema";

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
}

export interface PaginatedRows {
  rows: ProductRow[];
  total: number;
}

@Injectable()
export class ProductsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(data: CreateProductData): Promise<ProductRow> {
    const [row] = await this.db
      .insert(products)
      .values({
        name: data.name,
        description: data.description,
        // NUMERIC accepts a string; format to the column's 2dp scale.
        price: data.price.toFixed(2),
      })
      .returning();

    return row as ProductRow;
  }

  async deleteById(id: string): Promise<ProductRow | undefined> {
    const [row] = await this.db
      .delete(products)
      .where(eq(products.id, id))
      .returning();

    return row;
  }

  async findPaginated(page: number, limit: number): Promise<PaginatedRows> {
    const offset = (page - 1) * limit;

    const [rows, [totals]] = await Promise.all([
      this.db
        .select()
        .from(products)
        .orderBy(desc(products.createdAt))
        .limit(limit)
        .offset(offset),
      this.db.select({ value: count() }).from(products),
    ]);

    return { rows, total: totals?.value ?? 0 };
  }
}
