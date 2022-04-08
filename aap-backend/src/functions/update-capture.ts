// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";

import { validator, HandlerFn } from "twilio-flex-token-validator";
import {
  PaymentCapture,
  PaymentInstanceUpdateOptions,
} from "twilio/lib/rest/api/v2010/account/call/payment";

type MyEvent = {
  Capturing: PaymentCapture;
  PaymentSid: string;
  IdempotencyKey: string;
  CallSid: string;
  Token: string;
  PartialResult: boolean;
};

// If you want to use environment variables, you will need to type them like
// this and add them to the Context in the function signature as
// Context<MyContext> as you see below.
type MyContext = {
  PAYMENT_CONNECTOR: string;
  SYNC_SERVICE_SID: string;
  ACCOUNT_SID: string;
  AUTH_TOKEN: string;
  NGROK_ENDPOINT: string;
};

export const handler: ServerlessFunctionSignature<MyContext, MyEvent> =
  async function (
    context: Context<MyContext>,
    event: MyEvent,
    callback: ServerlessCallback
  ) {
    const cors = require(Runtime.getFunctions()["utility/cors-response"].path);

    try {
      await validator(
        event.Token ?? "",
        context.ACCOUNT_SID ?? "",
        context.AUTH_TOKEN ?? ""
      );

      try {
        const client = context.getTwilioClient();

        const paymentUpdateOptions: PaymentInstanceUpdateOptions = {
          capture: event.Capturing,
          idempotencyKey: event.IdempotencyKey,
          statusCallback: `https://${
            context.DOMAIN_NAME?.includes("http://localhost")
              ? context.NGROK_ENDPOINT
              : context.DOMAIN_NAME
          }/webhook-ingress`,
        };

        try {
          const payment = await client
            .calls(event.CallSid)
            .payments(event.PaymentSid)
            .update(paymentUpdateOptions);

          console.log(`Payment updated ${payment.sid}`);

          callback(null, cors.response(payment, 200));
        } catch (error) {
          console.log("Error updating the pay session", error),
            event.CallSid,
            event.PaymentSid;
          callback(null, cors.response(error, 500));
        }
      } catch (error) {
        console.log(
          "Error updating the pay session",
          error,
          event.CallSid,
          event.PaymentSid
        );
        callback(null, cors.response(error, 500));
      }
    } catch (error) {
      const resp = cors.response(error, 403);
      callback(null, resp);
    }
  };
