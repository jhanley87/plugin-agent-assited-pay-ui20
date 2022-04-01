import axios from "axios";
import ApiRequests from "./requests/ApiRequests";
import BeginPayRequest from "./requests/BeginPayRequest";
import CompletePayRequest from "./requests/CompletePayRequest";
import UpdateCaptureRequest from "./requests/UpdateCaptureRequest";
import SyncTokenResponse from "./responses/SyncTokenResponse";
export default class Api {
  public async BeginPaySession(input: BeginPayRequest) {
    const resp = await this.postApiRequest<PaymentResponse>(
      ApiRequests.BeginPay,
      input
    );

    return resp;
  }

  public async CompletePaySession(input: CompletePayRequest) {
    const resp = await this.postApiRequest(ApiRequests.CompletePay, input);

    return resp;
  }

  public async UpdateCapture(input: UpdateCaptureRequest) {
    const resp = await this.postApiRequest(ApiRequests.UpdateCapture, input);

    return resp;
  }

  public async GetSyncToken(identity: string): Promise<SyncTokenResponse> {
    const resp = await this.postApiRequest<SyncTokenResponse>(
      ApiRequests.SyncToken,
      { identity }
    );

    return resp?.data ?? { token: "none" };
  }

  private getFlextoken() {
    return window.Twilio.Flex.Manager.getInstance().store.getState().flex
      .session.ssoTokenPayload.token;
  }

  private async postApiRequest<T>(url: string, data: any) {
    try {
      data = { ...data, Token: this.getFlextoken() };
      const axiosResponse = await axios.post<T>(url, data, { timeout: 10000 });

      const apiResponse: ApiResponse<T> = {
        data: axiosResponse.data,
        responseCode: axiosResponse.status,
        statusText: axiosResponse.statusText,
      };

      return apiResponse;
    } catch (error) {
      console.error(`Error making api request to ${url}`, error);
    }
  }
}

interface ApiResponse<T> {
  statusText?: string;
  responseCode?: number;
  data?: T;
}
