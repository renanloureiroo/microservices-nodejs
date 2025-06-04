import { integer, pgTable, text, pgEnum, timestamp } from "drizzle-orm/pg-core";
import { costumers } from "./costumers.ts";

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "cancelled",
]);

export const orders = pgTable("orders", {
  id: text().primaryKey(),
  costumerId: text()
    .notNull()
    .references(() => costumers.id),
  amount: integer().notNull(),
  status: orderStatusEnum().notNull().default("pending"),
  createdAt: timestamp().notNull().defaultNow(),
});
