// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";

import { validator } from "twilio-flex-token-validator";
import { PayTokenType } from "twilio/lib/twiml/VoiceResponse";
import {
  PaymentListInstanceCreateOptions,
  PaymentPaymentMethod,
} from "twilio/lib/rest/api/v2010/account/call/payment";

type MyEvent = {
  ChargeAmount?: number;
  IdempotencyKey: string;
  Currency: string;
  PaymentMethod: PaymentPaymentMethod;
  TokenType: PayTokenType;
  Description: string;
  Timout?: number;
  CallSid: string;
  Token: string;
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
    console.log("CORS", cors);

    try {
      await validator(
        event.Token ?? "",
        context.ACCOUNT_SID ?? "",
        context.AUTH_TOKEN ?? ""
      );

      const client = context.getTwilioClient();

      //the default timeout for time between keypad presses
      const defaultTimeout = 5;
      //how long the sync list will live for (in seconds)
      const syncTtl = 86400;

      console.log("starting execution for begin-payment", event);

      const paymentOptions: PaymentListInstanceCreateOptions = {
        chargeAmount: event.ChargeAmount,
        idempotencyKey: event.IdempotencyKey,
        paymentConnector: context.PAYMENT_CONNECTOR,
        postalCode: false,
        statusCallback: `https://${
          context.DOMAIN_NAME?.includes("http://localhost")
            ? context.NGROK_ENDPOINT
            : context.DOMAIN_NAME
        }/webhook-ingress`,
        validCardTypes: "visa mastercard amex",
        paymentMethod: event.PaymentMethod,
        description: event.Description,
        timeout: event.Timout ?? defaultTimeout,
        tokenType: event.TokenType,
      };

      try {
        console.log("Creating Sync List");
        const syncList = await client.sync
          .services(context.SYNC_SERVICE_SID)
          .syncLists.create({
            uniqueName: `aap:${event.CallSid}`,
            ttl: syncTtl,
          });

        console.log(`list created ${syncList.sid}. Beginning pay session`);

        try {
          const payment = await client
            .calls(event.CallSid)
            .payments.create(paymentOptions);

          console.log(`Payment created ${payment.sid}`);

          const resp = cors.response(payment, 200);
          console.log("response", resp);

          callback(null, cors.response(payment, 200));
        } catch (error) {
          console.log("Error creating the pay session", error);
          callback(null, cors.response(error, 500));
        }
      } catch (error) {
        console.error("Error creating SyncList", error);
        callback(null, cors.response(error, 500));
      }
    } catch (error) {
      callback(null, cors.response(error, 403));
    }
  };
