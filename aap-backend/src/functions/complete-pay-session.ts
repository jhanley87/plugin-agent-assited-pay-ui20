// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";

import { functionValidator, HandlerFn } from "twilio-flex-token-validator";
import { PaymentPaymentMethod, PaymentStatus } from "twilio/lib/rest/api/v2010/account/call/payment";
import CorsResponse from "../utility/cors-response";

type MyEvent = {
  PaymentSid: string;
  IdempotencyKey: string;
  CallSid: string;
};

// If you want to use environment variables, you will need to type them like
// this and add them to the Context in the function signature as
// Context<MyContext> as you see below.
type MyContext = {
  PAYMENT_CONNECTOR: string;
  SYNC_SERVICE_SID: string;
};

export const handler: HandlerFn = functionValidator(
  () =>
    async (
      context: Context<MyContext>,
      event: MyEvent,
      callback: ServerlessCallback
    ) => {
        
      const client = context.getTwilioClient();

      const paymentUpdateOptions = {
        status: 'complete' as PaymentStatus,
        idempotencyKey: event.IdempotencyKey,
        statusCallback: 'https://' + context.DOMAIN_NAME + '/webhook-ingress'
      }
      
        try {
          const payment = await client
            .calls(event.CallSid)
            .payments(event.PaymentSid).update(paymentUpdateOptions);

          console.log(`Payment completed ${payment.sid}`);

          callback(null, CorsResponse.Create(payment));
        } catch (error) {
          console.log("Error completing the pay session", error);
          callback(CorsResponse.Create(error), undefined);
        }
        
    }
);
