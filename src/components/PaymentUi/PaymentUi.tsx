import React from "react";
import CreditCard from "../CreditCard/CreditCard";
import { Grid, Column, Box } from "@twilio-paste/core";
import { Theme } from "@twilio-paste/core/theme";
import InitForm, { InitFormState } from "../InitForm/InitForm";
import ApiClient from "../../api/Api";
import { TaskContextProps, withTaskContext } from "@twilio/flex-ui";
import { v4 as uuidv4, v4 } from "uuid";
import PayControlCentre from "../PayControlCentre/PayControlCentre";
import { PayCaptureParameter } from "common/PayCaptureParameter";
import { SyncClient } from "twilio-sync";

interface AgentAssistedPayEvent {
  AccountSid: string;
  CallSid: string;
  DateCreated: string;
  PaymentConnector: string;
  PaymentMethod: string;
  Sid: string;
  TokenType: string;
  Capture: PayCaptureParameter;
  PaymentCardNumber: string;
  ExpirationDate: string;
  SecurityCode: string;
  PartialResult: boolean;
  ErrorType: string;
  Required: string;
}

interface OwnProps {
  // Props passed directly to the component
}

interface PaymentUiState {
  currentCapture?: PayCaptureParameter;
  syncToken: string;
  aapEvents: AgentAssistedPayEvent[];
  latestAapState?: AgentAssistedPayEvent;
}

// Props should be a combination of StateToProps, DispatchToProps, and OwnProps
type Props = OwnProps & TaskContextProps;

// It is recommended to keep components stateless and use redux for managing states
class PaymentUiComponent extends React.PureComponent<Props, PaymentUiState> {
  constructor(props: Props) {
    super(props);
  }

  readonly apiClient = new ApiClient();

  getSyncToken = async () => {
    const tokenResponse = await this.apiClient.GetSyncToken("Jordan");
    this.setState({ ...this.state, syncToken: tokenResponse.token });
  };

  subscribeToSyncList = async (token: string) => {
    const syncClient = new SyncClient(token);
    const listForPayment = await syncClient.list(
      `aap:${this.props.task?.attributes.call_sid}`
    );

    const paginator = await listForPayment.getItems({
      from: 0,
      order: "asc",
      limit: 1000,
    });

    paginator.items.forEach((item) => this.addPaymentEventToState(item.data));

    listForPayment.on("itemAdded", (syncListItem) =>
      this.addPaymentEventToState(syncListItem.item.data)
    );

    syncClient.on("tokenAboutToExpire", async () => {
      await this.getSyncToken();
      syncClient.updateToken(this.state.syncToken);
    });
  };

  addPaymentEventToState = (item: any) => {
    console.debug("aap event added", item);
    this.setState({
      ...this.state,
      aapEvents: [...this.state.aapEvents, item],
    });
    this.setState({ ...this.state, latestAapState: this.latestAapEvent() });
  };

  readonly state: PaymentUiState = {
    currentCapture: undefined,
    syncToken: "",
    aapEvents: [],
    latestAapState: undefined,
  };

  handleStartPayment = async (state: InitFormState) => {
    await this.apiClient.BeginPaySession({
      CallSid: this.props.task?.attributes.call_sid,
      ChargeAmount: state.amount,
      Description: state.description,
      Currency: "gbp",
      TokenType: state.selectedTokenType.val,
      PaymentMethod: "credit-card",
      IdempotencyKey: uuidv4(),
    });
    //Get the sync token ready in the state
    await this.getSyncToken();
    //subscribe to the sync list for this payment session
    await this.subscribeToSyncList(this.state.syncToken);
  };

  latestAapEvent = () => {
    return this.state.aapEvents[this.state.aapEvents.length - 1];
  };

  handleChangeCapture = async (paramToCapture: PayCaptureParameter) => {
    await this.setState({ ...this.state, currentCapture: paramToCapture });
    this.apiClient.UpdateCapture({
      Capturing: paramToCapture,
      PaymentSid: this.latestAapEvent().Sid,
      IdempotencyKey: v4(),
      CallSid: this.props.task?.attributes.call_sid,
    });

    this.setState({...this.state, currentCapture: paramToCapture});
  };

  render() {
    return (
      <Theme.Provider theme="default">
        <Grid margin="space0">
          <Column span={12} gutter="space10">
            <InitForm handleSubmit={this.handleStartPayment}></InitForm>
          </Column>
          <Column span={12} gutter="space10">
            <CreditCard
              creditCardNumber={this.state.latestAapState?.PaymentCardNumber}
              expiryDate={this.state.latestAapState?.ExpirationDate}
              securityCode={this.state.latestAapState?.SecurityCode}
              currentCapture={this.state.latestAapState?.Capture ?? this.state.currentCapture}
              captureInProgress={this.state.latestAapState?.PartialResult}
              hasError={this.state.latestAapState?.ErrorType === "input-timeout" ? true : false}
            ></CreditCard>
          </Column>
          <Column span={12} gutter="space10">
            <PayControlCentre
              handleChangeCapture={this.handleChangeCapture}
              canComplete={
                this.state.latestAapState?.Required ?? "" === "" ? true : false
              }
            ></PayControlCentre>
          </Column>
        </Grid>
      </Theme.Provider>
    );
  }
}

export const PaymentUi = withTaskContext(PaymentUiComponent);
