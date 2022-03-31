export default interface BeginPayRequest {
  ChargeAmount: number;
  IdempotencyKey: string;
  Currency: string;
  PaymentMethod: "credit-card" | "ach-debit";
  TokenType: "one-time" | "reusable";
  Description: string;
  Timout?: number;
  CallSid: string;
}
