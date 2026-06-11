
export const NOTIFICATIONS_QUEUE = "notifications_queue";

export const ProductEventPattern = {
  Created: "product.created",
  Deleted: "product.deleted",
} as const;

export type ProductEventPattern =
  (typeof ProductEventPattern)[keyof typeof ProductEventPattern];

export interface ProductCreatedEvent {
  id: string;
  name: string;
  price: number;
  occurredAt: string;
}

export interface ProductDeletedEvent {
  id: string;
  name: string;
  occurredAt: string;
}

export interface ProductEventPayloadMap {
  [ProductEventPattern.Created]: ProductCreatedEvent;
  [ProductEventPattern.Deleted]: ProductDeletedEvent;
}
