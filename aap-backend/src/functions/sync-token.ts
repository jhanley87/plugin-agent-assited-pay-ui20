// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";

import { SyncGrant } from "twilio/lib/jwt/AccessToken";
import { validator } from "twilio-flex-token-validator";

type MyEvent = {
  identity: string;
  Token: string;
};

// If you want to use environment variables, you will need to type them like
// this and add them to the Context in the function signature as
// Context<MyContext> as you see below.
type MyContext = {
  TWILIO_API_KEY: string;
  SYNC_SERVICE_SID: string;
  TWILIO_API_SECRET: string;
  ACCOUNT_SID: string;
  AUTH_TOKEN: string;
};

export const handler: ServerlessFunctionSignature<MyContext, MyEvent> =
  async function (
    context: Context<MyContext>,
    event: MyEvent,
    callback: ServerlessCallback
  ) {

    const cors = require(Runtime.getFunctions()['utility/cors-response'].path)

    try {
      await validator(
        event.Token ?? "",
        context.ACCOUNT_SID ?? "",
        context.AUTH_TOKEN ?? ""
      );

      try {
        console.log("starting execution", event);

        const IDENTITY = event.identity;

        const accessToken = new Twilio.jwt.AccessToken(
          context.ACCOUNT_SID,
          context.TWILIO_API_KEY,
          context.TWILIO_API_SECRET
        );

        accessToken.addGrant(
          new SyncGrant({ serviceSid: context.SYNC_SERVICE_SID })
        );
        accessToken.identity = IDENTITY;

        callback(
          null,
          cors.response({ token: accessToken.toJwt() }, 200)
        );
      } catch (error) {
        const resp = cors.response(error, 500);
        callback(null, resp);
      }
    } catch (error) {
      const resp = cors.response(error, 403);
      callback(null, resp);
    }
  };
