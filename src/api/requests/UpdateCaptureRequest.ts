export default interface UpdateCaptureRequest {
  Capturing:
    | "payment-card-number"
    | "expiration-date"
    | "security-code"
    | "postal-code"
    | "bank-routing-number"
    | "bank-account-number";
  PaymentSid: string;
  IdempotencyKey: string;
  CallSid: string;
}
