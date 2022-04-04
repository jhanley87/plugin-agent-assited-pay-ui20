export default interface CancelPayRequest {
  PaymentSid: string;
  IdempotencyKey: string;
  CallSid: string;
}
