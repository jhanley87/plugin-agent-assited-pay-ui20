export default class CorsResponse {
    public static Create(originalResponse: any) {
        const corsResponse = new Response(originalResponse);

        corsResponse.headers.append('Access-Control-Allow-Origin', '*');
        corsResponse.headers.append('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
        corsResponse.headers.append('Access-Control-Allow-Headers', 'Content-Type');
        corsResponse.headers.append('Content-Type', 'application/json');
        
        return new Response()
    }
}