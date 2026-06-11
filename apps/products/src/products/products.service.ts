import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import type { Paginated, Product } from "@repo/contracts";

import { ProductEventsPublisher } from "../messaging/product-events.publisher";
import { CreateProductDto } from "./dto/create-product.dto";
import { PaginationQueryDto } from "./dto/pagination-query.dto";
import { buildPaginationMeta, toProduct } from "./product.mapper";
import { ProductsRepository } from "./products.repository";

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private readonly repository: ProductsRepository,
    private readonly events: ProductEventsPublisher,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const row = await this.repository.create({
      name: dto.name,
      description: dto.description ?? "",
      price: dto.price,
    });

    const product = toProduct(row);
    this.logger.log(`Created product ${product.id}`);
    await this.events.publishCreated(product);

    return product;
  }

  async findAll(query: PaginationQueryDto): Promise<Paginated<Product>> {
    const { page, limit } = query;
    const { rows, total } = await this.repository.findPaginated(page, limit);

    return {
      data: rows.map(toProduct),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async remove(id: string): Promise<void> {
    const row = await this.repository.deleteById(id);

    if (!row) {
      throw new NotFoundException(`Product with id "${id}" was not found`);
    }

    const product = toProduct(row);
    this.logger.log(`Deleted product ${product.id}`);
    await this.events.publishDeleted(product);
  }
}
