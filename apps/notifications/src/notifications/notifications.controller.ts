import { Controller, Logger } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import {
  type ProductCreatedEvent,
  type ProductDeletedEvent,
  ProductEventPattern,
} from "@repo/contracts";

@Controller()
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  @EventPattern(ProductEventPattern.Created)
  handleProductCreated(@Payload() event: ProductCreatedEvent): void {
    this.logger.log(
      `🆕 Product created — id=${event.id} name="${event.name}" ` +
        `price=${event.price} at=${event.occurredAt}`,
    );
  }

  @EventPattern(ProductEventPattern.Deleted)
  handleProductDeleted(@Payload() event: ProductDeletedEvent): void {
    this.logger.log(
      `🗑️  Product deleted — id=${event.id} name="${event.name}" ` +
        `at=${event.occurredAt}`,
    );
  }
}
