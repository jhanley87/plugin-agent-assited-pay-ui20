// Imports global types
import "@twilio-labs/serverless-runtime-types";

export const response = function (OriginalResponse: any, statusCode: number) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  const corsResponse = new Twilio.Response();
  corsResponse.setBody(OriginalResponse);
  corsResponse.setStatusCode(statusCode);
  corsResponse.setHeaders(corsHeaders);

  console.debug("Cors Response", corsResponse);

  return corsResponse;
};
