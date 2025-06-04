export interface OrderCreatedMessage {
  orderId: string;
  amount: number;
  costumer: {
    id: string;
  };
}
