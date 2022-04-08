import { PayCaptureParameter } from "common/PayCaptureParameter";

export default interface AgentAssistedPayEvent {
    AccountSid: string;
    CallSid: string;
    DateCreated: string;
    PaymentConnector: string;
    PaymentMethod: string;
    Sid: string;
    TokenType?: string | undefined;
    Capture: PayCaptureParameter;
    PaymentCardNumber: string;
    ExpirationDate: string;
    SecurityCode: string;
    PartialResult: boolean;
    ErrorType: string;
    Required: string;
    Result:
      | "success"
      | "payment-connecter-error"
      | "caller-interrupted-with-star"
      | "caller-hung-up"
      | "validation-error"
      | "transaction-cancelled"
      | undefined;
    PaymentError: string | undefined;
    PaymentConfirmationCode: string;
    PaymentToken: string;
    ProfileId: string;
  }