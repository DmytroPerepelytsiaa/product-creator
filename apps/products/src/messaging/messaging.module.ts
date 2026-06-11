import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientsModule, type RmqOptions, Transport } from "@nestjs/microservices";
import { NOTIFICATIONS_QUEUE } from "@repo/contracts";

import type { Env } from "../config/env";
import { ProductEventsPublisher } from "./product-events.publisher";
import { NOTIFICATIONS_CLIENT } from "./messaging.tokens";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: NOTIFICATIONS_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService<Env, true>): RmqOptions => {
          const url: string = config.getOrThrow("RABBITMQ_URL", {
            infer: true,
          });
          return {
            transport: Transport.RMQ,
            options: {
              urls: [url],
              queue: NOTIFICATIONS_QUEUE,
              queueOptions: { durable: true },
            },
          };
        },
      },
    ]),
  ],
  providers: [ProductEventsPublisher],
  exports: [ProductEventsPublisher],
})
export class MessagingModule {}
