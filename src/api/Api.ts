import axios from "axios"
import ApiRequests from "./requests/ApiRequests";
import BeginPayRequest from "./requests/BeginPayRequest";
import CompletePayRequest from "./requests/CompletePayRequest";
import UpdateCaptureRequest from "./requests/UpdateCaptureRequest";
export default class Api {

    public async BeginPaySession(input: BeginPayRequest){
        const resp = await this.postApiRequest<PaymentResponse>(ApiRequests.BeginPay, input);

        return resp;
    }

    public async CompletePaySession(input: CompletePayRequest){
        const resp = await this.postApiRequest(ApiRequests.CompletePay, input);

        return resp;
    }

    public async UpdateCapture(input: UpdateCaptureRequest){
        const resp = await this.postApiRequest(ApiRequests.UpdateCapture, input);

        return resp;
    }

    private async postApiRequest<T>(url: string, data: any){
        try{
            const axiosResponse =  await axios.post<T>(url, data);

            const apiResponse :ApiResponse<T> = {
                data: axiosResponse.data,
                responseCode: axiosResponse.status,
                statusText: axiosResponse.statusText
            } 

            return apiResponse;
        }
        catch(error){
            console.error(`Error making api request to ${url}`, error);
        }
    }
}

interface ApiResponse<T>{
	statusText?: string;
	responseCode?: number;
	data?: T;
}