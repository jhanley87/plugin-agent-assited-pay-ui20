// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";

import { validator } from "twilio-flex-token-validator";

type MyEvent = {
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

    try {
      await validator(
        event.Token ?? "",
        context.ACCOUNT_SID ?? "",
        context.AUTH_TOKEN ?? ""
      );
    } catch (error) {
      callback(null, cors.response(error, 403));
    }

    const client = context.getTwilioClient();

    //the default timeout for time between keypad presses
    const defaultTimeout = 5;
    //how long the sync list will live for (in seconds)
    const syncTtl = 86400;

    console.log("starting execution for begin-payment", event);

    try {
      console.log("Creating Sync List");
      const syncList = await client.sync
        .services(context.SYNC_SERVICE_SID)
        .syncLists(`aap:${event.CallSid}`)
        .remove();

      console.log(`list deleted`);
    } catch (error) {
      console.error("Error deleting SyncList", error);
    }

    callback(null, cors.response(null, 200));
  };
