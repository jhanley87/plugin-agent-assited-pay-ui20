// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";

import { validator } from "twilio-flex-token-validator";
import { PaymentStatus } from "twilio/lib/rest/api/v2010/account/call/payment";

type MyEvent = {
  PaymentSid: string;
  IdempotencyKey: string;
  CallSid: string;
  Token: string;
};

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

      const client = context.getTwilioClient();

      const paymentUpdateOptions = {
        status: "complete" as PaymentStatus,
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

        console.log(`Payment completed ${payment.sid}`);

        callback(null, cors.response(payment, 200));
      } catch (error) {
        console.log("Error completing the pay session", error);
        callback(null, cors.response(error, 500));
      }
    } catch (error) {
      const resp = cors.response(error, 403);
      callback(null, resp);
    }
  };
