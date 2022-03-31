export default interface CompletePayRequest {
  PaymentSid: string;
  IdempotencyKey: string;
  CallSid: string;
}
