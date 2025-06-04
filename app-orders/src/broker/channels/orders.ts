import { brokerClient } from "../broker-client.ts";

export const orders = await brokerClient.createChannel();

await orders.assertQueue("orders");
