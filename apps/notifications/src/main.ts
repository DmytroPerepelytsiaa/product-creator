import "reflect-metadata";
import "dotenv/config";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { type MicroserviceOptions, Transport } from "@nestjs/microservices";
import { NOTIFICATIONS_QUEUE } from "@repo/contracts";

import { AppModule } from "./app.module";
import { validateEnv } from "./config/env";

async function bootstrap(): Promise<void> {
  const env = validateEnv(process.env);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [env.RABBITMQ_URL],
        queue: NOTIFICATIONS_QUEUE,
        queueOptions: { durable: true },
      },
    },
  );

  app.enableShutdownHooks();
  await app.listen();

  Logger.log(
    `Notifications service is listening on queue "${NOTIFICATIONS_QUEUE}"`,
    "Bootstrap",
  );
}

void bootstrap();
