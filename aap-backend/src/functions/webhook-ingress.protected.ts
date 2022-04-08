// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";

import { functionValidator, HandlerFn } from "twilio-flex-token-validator";
import { PaymentPaymentMethod } from "twilio/lib/rest/api/v2010/account/call/payment";

type MyEvent = {
  CallSid?: string;
};

// If you want to use environment variables, you will need to type them like
// this and add them to the Context in the function signature as
// Context<MyContext> as you see below.
type MyContext = {
  SYNC_SERVICE_SID?: string;
};

export const handler: ServerlessFunctionSignature = async function (
  context: Context<MyContext>,
  event: MyEvent,
  callback: ServerlessCallback
) {
  const cors = require(Runtime.getFunctions()['utility/cors-response'].path)

  const client = context.getTwilioClient();

  console.log("starting execution");

  try {
    const syncListItem = await client.sync
      .services(context.SYNC_SERVICE_SID ?? '')
      .syncLists(`aap:${event.CallSid}`)
      .syncListItems.create({
        data: event,
      });

    console.log(
      `list item created ${syncListItem.listSid}.`
    );

    callback(null, cors.response(syncListItem, 200));
  } catch (error) {
    console.error("Error creating SyncList item", error);
    callback(cors.response(error, 500), undefined);
  }
};
