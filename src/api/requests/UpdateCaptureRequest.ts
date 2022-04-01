import { PayCaptureParameter } from "common/PayCaptureParameter";

export default interface UpdateCaptureRequest {
  Capturing: PayCaptureParameter;
  PaymentSid: string;
  IdempotencyKey: string;
  CallSid: string;
}
