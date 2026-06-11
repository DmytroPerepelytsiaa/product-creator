import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import {
  type Product,
  type ProductCreatedEvent,
  type ProductDeletedEvent,
  ProductEventPattern,
} from "@repo/contracts";
import { lastValueFrom } from "rxjs";

import { NOTIFICATIONS_CLIENT } from "./messaging.tokens";

/**
 * Publishes product lifecycle events to RabbitMQ.
 *
 * Notifications are a best-effort side effect: if the broker is unavailable we
 * log the failure but never fail the originating HTTP request, since the
 * product change has already been committed to the database.
 */
@Injectable()
export class ProductEventsPublisher {
  private readonly logger = new Logger(ProductEventsPublisher.name);

  constructor(
    @Inject(NOTIFICATIONS_CLIENT) private readonly client: ClientProxy,
  ) {}

  async publishCreated(product: Product): Promise<void> {
    const event: ProductCreatedEvent = {
      id: product.id,
      name: product.name,
      price: product.price,
      occurredAt: new Date().toISOString(),
    };
    await this.emit(ProductEventPattern.Created, event);
  }

  async publishDeleted(product: Pick<Product, "id" | "name">): Promise<void> {
    const event: ProductDeletedEvent = {
      id: product.id,
      name: product.name,
      occurredAt: new Date().toISOString(),
    };
    await this.emit(ProductEventPattern.Deleted, event);
  }

  private async emit(pattern: string, payload: unknown): Promise<void> {
    try {
      await lastValueFrom(this.client.emit(pattern, payload));
      this.logger.debug(`Published "${pattern}"`);
    } catch (error) {
      this.logger.error(
        `Failed to publish "${pattern}": ${(error as Error).message}`,
      );
    }
  }
}
