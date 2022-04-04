export default interface BeginPayRequest {
  ChargeAmount?: number;
  IdempotencyKey: string;
  Currency: string;
  PaymentMethod: "credit-card" | "ach-debit";
  TokenType: "one-time" | "reusable" | undefined;
  Description: string;
  Timout?: number;
  CallSid: string;
}
