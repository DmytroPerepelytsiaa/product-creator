/**
 * Messaging contract shared between the Products (producer) and
 * Notifications (consumer) services. Keeping it in one package guarantees
 * both sides agree on queue names, routing patterns and payload shapes.
 */

/** Durable RabbitMQ queue that carries Products -> Notifications events. */
export const NOTIFICATIONS_QUEUE = "notifications_queue";

/** Routing patterns emitted by the Products service. */
export const ProductEventPattern = {
  Created: "product.created",
  Deleted: "product.deleted",
} as const;

export type ProductEventPattern =
  (typeof ProductEventPattern)[keyof typeof ProductEventPattern];

/** Emitted after a product is successfully created. */
export interface ProductCreatedEvent {
  id: string;
  name: string;
  price: number;
  /** ISO-8601 timestamp of when the event occurred. */
  occurredAt: string;
}

/** Emitted after a product is successfully deleted. */
export interface ProductDeletedEvent {
  id: string;
  name: string;
  /** ISO-8601 timestamp of when the event occurred. */
  occurredAt: string;
}

/** Maps each routing pattern to the payload it carries. */
export interface ProductEventPayloadMap {
  [ProductEventPattern.Created]: ProductCreatedEvent;
  [ProductEventPattern.Deleted]: ProductDeletedEvent;
}
