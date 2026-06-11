import { NotFoundException } from "@nestjs/common";

import type { ProductRow } from "../database/schema";
import { ProductEventsPublisher } from "../messaging/product-events.publisher";
import { ProductsRepository } from "./products.repository";
import { ProductsService } from "./products.service";

describe("ProductsService", () => {
  let service: ProductsService;
  let repository: jest.Mocked<
    Pick<ProductsRepository, "create" | "deleteById" | "findPaginated">
  >;
  let events: jest.Mocked<
    Pick<ProductEventsPublisher, "publishCreated" | "publishDeleted">
  >;

  const row: ProductRow = {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Keyboard",
    description: "Mechanical",
    price: "19.99",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  };

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      deleteById: jest.fn(),
      findPaginated: jest.fn(),
    };
    events = {
      publishCreated: jest.fn().mockResolvedValue(undefined),
      publishDeleted: jest.fn().mockResolvedValue(undefined),
    };
    service = new ProductsService(
      repository as unknown as ProductsRepository,
      events as unknown as ProductEventsPublisher,
    );
  });

  it("creates a product, maps the row and publishes an event", async () => {
    repository.create.mockResolvedValue(row);

    const result = await service.create({
      name: "Keyboard",
      description: "Mechanical",
      price: 19.99,
    });

    expect(repository.create).toHaveBeenCalledWith({
      name: "Keyboard",
      description: "Mechanical",
      price: 19.99,
    });
    expect(result).toEqual({
      id: row.id,
      name: "Keyboard",
      description: "Mechanical",
      price: 19.99,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    });
    expect(events.publishCreated).toHaveBeenCalledWith(result);
  });

  it("defaults a missing description to an empty string", async () => {
    repository.create.mockResolvedValue({ ...row, description: "" });

    await service.create({ name: "Keyboard", price: 1 });

    expect(repository.create).toHaveBeenCalledWith({
      name: "Keyboard",
      description: "",
      price: 1,
    });
  });

  it("throws NotFound when deleting a missing product and does not publish", async () => {
    repository.deleteById.mockResolvedValue(undefined);

    await expect(service.remove("missing-id")).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(events.publishDeleted).not.toHaveBeenCalled();
  });

  it("deletes an existing product and publishes a delete event", async () => {
    repository.deleteById.mockResolvedValue(row);

    await service.remove(row.id);

    expect(events.publishDeleted).toHaveBeenCalledWith(
      expect.objectContaining({ id: row.id, name: "Keyboard" }),
    );
  });

  it("returns paginated products with correct metadata", async () => {
    repository.findPaginated.mockResolvedValue({ rows: [row], total: 12 });

    const result = await service.findAll({ page: 2, limit: 5 });

    expect(repository.findPaginated).toHaveBeenCalledWith(2, 5);
    expect(result.data).toHaveLength(1);
    expect(result.meta).toEqual({
      page: 2,
      limit: 5,
      total: 12,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true,
    });
  });
});
