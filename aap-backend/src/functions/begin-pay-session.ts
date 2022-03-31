// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";

import { functionValidator, HandlerFn } from "twilio-flex-token-validator";
import { PaymentListInstanceCreateOptions, PaymentPaymentMethod } from "twilio/lib/rest/api/v2010/account/call/payment";
import { PayTokenType } from "twilio/lib/twiml/VoiceResponse";
import CorsResponse from "../utility/cors-response";

type MyEvent = {
  ChargeAmount: number;
  IdempotencyKey: string;
  Currency: string;
  PaymentMethod: PaymentPaymentMethod;
  TokenType: PayTokenType,
  Description: string;
  Timout?: number;
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
      //twilio serverless:logs --tail

      const client = context.getTwilioClient();

      //the default timeout for time between keypad presses
      const defaultTimeout = 5;
      //how long the sync list will live for (in seconds)
      const syncTtl = 86400;
      
      console.log("starting execution");

      const paymentOptions : PaymentListInstanceCreateOptions = {
        chargeAmount: event.ChargeAmount,
        idempotencyKey: event.IdempotencyKey,
        paymentConnector: context.PAYMENT_CONNECTOR,
        postalCode: false,
        statusCallback: "https://" + context.DOMAIN_NAME + "/webhook-ingress",
        currency: event.Currency,
        validCardTypes: "visa mastercard amex",
        paymentMethod: event.PaymentMethod,
        description: event.Description,
        timeout: event.Timout ?? defaultTimeout,
        tokenType: event.TokenType
      };

      try {
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

          callback(null, CorsResponse.Create(payment));
        } catch (error) {
          console.log("Error creating the pay session", error);
          callback(CorsResponse.Create(error), undefined);
        }
      } catch (error) {
        console.error("Error creating SyncList", error);
        callback(CorsResponse.Create(error), undefined);
      }
    }
);
