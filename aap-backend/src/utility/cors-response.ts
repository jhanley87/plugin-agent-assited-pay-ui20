export default class CorsResponse {
    public static Create(originalResponse: any, statusCode:number) {
        console.debug("Original Response", originalResponse);
        
        const corsHeaders = {
            'Access-Control-Allow-Origin' : '*',
            'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Content-Type': 'application/json'
        };

        const corsResponse = new Twilio.Response()
        corsResponse.setBody(originalResponse);
        corsResponse.setStatusCode(statusCode);
        corsResponse.setHeaders(corsHeaders);

        console.debug("Cors Response", corsResponse);

        return corsResponse;
    }
}