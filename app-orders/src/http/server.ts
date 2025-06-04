import "@opentelemetry/auto-instrumentations-node/register";
import { trace } from "@opentelemetry/api";
import fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { z } from "zod";
import fastifyCors from "@fastify/cors";
import { db } from "../db/db-client.ts";
import { schema } from "../db/schema/index.ts";
import { randomUUID } from "node:crypto";
import { setTimeout } from "node:timers/promises";
import { dispatchOrderCreated } from "../broker/messages/order-created.ts";
import { tracer } from "../tracer/tracer.ts";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.register(fastifyCors, {
  origin: "*",
});

app.get("/health", () => {
  return "OK";
});

app.post(
  "/orders",
  {
    schema: {
      body: z.object({
        amount: z.coerce.number(),
      }),
    },
  },
  async (request, reply) => {
    const { amount } = request.body;

    console.log(`[Orders] Order created: ${amount}`);

    const orderId = randomUUID();
    const costumerId = "280af301-af6d-4a7f-95ac-1a4e2493fac5";
    await db.insert(schema.orders).values({
      id: orderId,
      amount,
      costumerId: "280af301-af6d-4a7f-95ac-1a4e2493fac5",
    });

    const span = tracer.startSpan("orders.test");

    await setTimeout(2000);

    span.end();

    trace
      .getActiveSpan()
      ?.setAttribute("order.id", orderId)
      .setAttribute("order.amount", amount);

    dispatchOrderCreated({
      orderId,
      amount,
      costumer: {
        id: costumerId,
      },
    });

    reply.status(201).send();
  }
);

app.listen({ host: "0.0.0.0", port: 3333 }, (err, address) => {
  if (err) {
    app.log.error(err);
  }
  console.log(`[Orders] Server is running on ${address}`);
});
