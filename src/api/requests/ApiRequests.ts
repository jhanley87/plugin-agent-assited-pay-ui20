import Config from "../../Config"

export default class ApiRequests {
    private static baseUri : string = Config.backendBaseUri

    public static BeginPay: string = `${this.baseUri}/begin-pay-session`;
    public static UpdateCapture: string = `${this.baseUri}/update-capture`;
    public static CompletePay: string = `${this.baseUri}/complete-pay-session`;
    public static SyncToken: string = `${this.baseUri}/sync-token`;
    public static WebhookIngress: string = `${this.baseUri}/webhook-ingress`;
}