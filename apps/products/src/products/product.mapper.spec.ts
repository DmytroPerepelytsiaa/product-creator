import type { ProductRow } from "../database/schema";
import { buildPaginationMeta, toProduct } from "./product.mapper";

describe("product.mapper", () => {
  describe("buildPaginationMeta", () => {
    it("handles an empty result set", () => {
      expect(buildPaginationMeta(1, 10, 0)).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    it("computes total pages and navigation flags for a middle page", () => {
      expect(buildPaginationMeta(2, 10, 25)).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      });
    });

    it("flags the last page correctly", () => {
      expect(buildPaginationMeta(3, 10, 25)).toMatchObject({
        hasNextPage: false,
        hasPreviousPage: true,
      });
    });
  });

  describe("toProduct", () => {
    it("converts the numeric price string to a number and dates to ISO", () => {
      const row: ProductRow = {
        id: "abc",
        name: "Mouse",
        description: "Wireless",
        price: "9.90",
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2024-01-02T00:00:00.000Z"),
      };

      expect(toProduct(row)).toEqual({
        id: "abc",
        name: "Mouse",
        description: "Wireless",
        price: 9.9,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-02T00:00:00.000Z",
      });
    });
  });
});
