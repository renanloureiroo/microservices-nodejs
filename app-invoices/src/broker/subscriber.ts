import { orders } from "./channels/orders.ts";

await orders.consume(
  "orders",
  (message) => {
    if (!message) {
      return null;
    }

    console.log(message.content.toString());
    orders.ack(message);
  },
  {
    noAck: false,
  }
);

// acknowLedge => reconhecer
// nack => não reconheceu a mensagem
// reject => rejeita a mensagem e não a coloca de volta na fila
// recove => recupera a mensagem e a coloca de volta na fila
