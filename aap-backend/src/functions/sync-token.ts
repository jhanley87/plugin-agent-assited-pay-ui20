// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";

import { functionValidator, HandlerFn } from "twilio-flex-token-validator";
import { SyncGrant } from "twilio/lib/jwt/AccessToken";
import { PaymentPaymentMethod } from "twilio/lib/rest/api/v2010/account/call/payment";
import CorsResponse from "../utility/cors-response";

type MyEvent = {
  ChargeAmount: number;
  IdempotencyKey: string;
  Currency: string;
  PaymentMethod: PaymentPaymentMethod;
  Description: string;
  Timout?: number;
  CallSid: string;
};

// If you want to use environment variables, you will need to type them like
// this and add them to the Context in the function signature as
// Context<MyContext> as you see below.
type MyContext = {
  TWILIO_API_KEY: string;
  SYNC_SERVICE_SID: string;
  TWILIO_API_SECRET: string;
  ACCOUNT_SID: string;
};

export const handler: HandlerFn = functionValidator(
  () =>
    async (
      context: Context<MyContext>,
      event: MyEvent,
      callback: ServerlessCallback
    ) => {
      //twilio serverless:logs --tail
      console.log("starting execution", event);

      //todo: fix this so that it gets the identity of the flex user
      const IDENTITY = "only for testing";

      const accessToken = new Twilio.jwt.AccessToken(
        context.ACCOUNT_SID,
        context.TWILIO_API_KEY,
        context.TWILIO_API_SECRET
      );

      accessToken.addGrant(
        new SyncGrant({ serviceSid: context.SYNC_SERVICE_SID })
      );
      accessToken.identity = IDENTITY;

      callback(null, CorsResponse.Create({ token: accessToken.toJwt() }));
    }
);
