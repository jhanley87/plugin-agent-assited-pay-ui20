import React, { useState, useEffect } from "react";
import CreditCard from "../CreditCard/CreditCard";
import {
  Grid,
  Column,
  Spinner,
  Toaster,
  useToaster,
  Text,
  Box,
} from "@twilio-paste/core";
import { Theme } from "@twilio-paste/core/theme";
import InitForm, { InitFormState } from "../InitForm/InitForm";
import ApiClient from "../../api/Api";
import { TaskContextProps, withTaskContext } from "@twilio/flex-ui";
import { v4 as uuidv4, v4 } from "uuid";
import PayControlCentre from "../PayControlCentre/PayControlCentre";
import { PayCaptureParameter } from "common/PayCaptureParameter";
import { SyncClient } from "twilio-sync";
import BeginPayRequest from "api/requests/BeginPayRequest";
import AgentAssistedPayEvent from "../../common/AgentAssistedPayEvent";
import { CreditCardIcon } from "@twilio-paste/icons/esm/CreditCardIcon";

type Step = "in-progress" | "not-started" | "loading" | "not-displayed";

interface OwnProps {
  // Props passed directly to the component
}

// Props should be a combination of StateToProps, DispatchToProps, and OwnProps
type Props = OwnProps & TaskContextProps;

const paymentUiComponent: React.FC<Props> = (props) => {
  const apiClient = new ApiClient();
  const toaster = useToaster();
  const [aapEvents, setAapEvents] = useState<AgentAssistedPayEvent[]>([]);
  const [latestAapState, setLatestAapState] = useState<
    AgentAssistedPayEvent | undefined
  >(undefined);
  const [step, setStep] = useState<Step>("not-displayed");

  const resetSession = async () => {
    setAapEvents([]);
    setLatestAapState(undefined);
    setStep("not-displayed");
  };

  useEffect(() => {
    window.Twilio.Flex.Actions.addListener("afterAcceptTask", (payload) => {
      resetSession();
    });

    window.Twilio.Flex.Actions.addListener("afterCompleteTask", (payload) => {
      resetSession();
    });

    window.Twilio.Flex.CallCanvasActions.Content.add(
      <button
        onClick={displayPaymentForm}
        className="MuiButtonBase-root MuiIconButton-root Twilio-IconButton Twilio-MuteButton Twilio-CallCanvas-MuteButton MuiIconButton-colorSecondary"
        key="pay-btn"
      >
        <CreditCardIcon decorative={false} title="Start Payment" />
      </button>,
      { sortOrder: -1 }
    );
  }, []);

  const getSyncToken = async () => {
    const tokenResponse = await apiClient.GetSyncToken("Jordan");
    return tokenResponse.token;
  };

  const displayPaymentForm = async () => {
    setStep("not-started");
  };

  const addPaymentEventToState = (item: AgentAssistedPayEvent) => {
    console.debug("aap event added", item);
    setAapEvents([...aapEvents, item]);

    setLatestAapState({ ...item });

    //check if this is the end of the payment
    if (item?.Result) {
      manageCompletion(item);
    }
  };

  const manageCompletion = (resultObj: AgentAssistedPayEvent) => {
    if (resultObj.Result === "success") {
      toaster.push({
        message: `Success! Your reference is ${
          resultObj.PaymentConfirmationCode
        } ${
          resultObj.PaymentToken
            ? "Token: " + resultObj.PaymentToken
            : resultObj.ProfileId
        }`,
        variant: "success",
      });
    } else if (resultObj.Result === "transaction-cancelled") {
      toaster.push({
        message: `Transaction cancelled`,
        variant: "neutral",
      });
    } else {
      toaster.push({
        message: `Oh no! This transaction was unsuccessful error: ${resultObj.PaymentError}`,
        variant: "error",
      });
    }
  };

  const subscribeToSyncList = async (token: string) => {
    const syncClient = new SyncClient(token);
    const listForPayment = await syncClient.list(
      `aap:${props.task?.attributes.call_sid}`
    );

    const paginator = await listForPayment.getItems({
      from: 0,
      order: "asc",
      limit: 1000,
    });

    paginator.items.forEach((item) =>
      addPaymentEventToState(item.data as AgentAssistedPayEvent)
    );

    listForPayment.on("itemAdded", (syncListItem) =>
      addPaymentEventToState(syncListItem.item.data)
    );

    syncClient.on("tokenAboutToExpire", async () => {
      var token = await getSyncToken();
      syncClient.updateToken(token);
    });
  };

  const handleStartPayment = async (stateFromInitForm: InitFormState) => {
    setStep("loading");
    try {
      const input: BeginPayRequest = {
        CallSid: props.task?.attributes.call_sid,
        ChargeAmount:
          stateFromInitForm.selectedPaySessionType.val === "payment"
            ? stateFromInitForm.amount
            : undefined,
        Description: stateFromInitForm.description,
        Currency: "gbp",
        TokenType:
          stateFromInitForm.selectedPaySessionType.val === "tokenisation"
            ? stateFromInitForm.selectedTokenType.val
            : undefined,
        PaymentMethod: "credit-card",
        IdempotencyKey: uuidv4(),
      };

      await apiClient.BeginPaySession(input);
      //Get the sync token ready in the state
      var token = await getSyncToken();
      //subscribe to the sync list for this payment session
      await subscribeToSyncList(token);

      setStep("in-progress");
    } catch (error) {
      setStep("not-started");
      console.error("Error starting payment", error);
    }
  };

  const handleChangeCapture = async (paramToCapture: PayCaptureParameter) => {
    try {
      apiClient.UpdateCapture({
        Capturing: paramToCapture,
        PaymentSid: latestAapState?.Sid ?? "",
        IdempotencyKey: v4(),
        CallSid: props.task?.attributes.call_sid,
      });
      if (latestAapState) {
        setLatestAapState({
          ...latestAapState,
          Capture: paramToCapture,
          PartialResult: true,
        });
      }
    } catch {}
  };

  const handleCompletePayment = async () => {
    apiClient.CompletePaySession({
      PaymentSid: latestAapState?.Sid ?? "",
      CallSid: props.task?.attributes.call_sid ?? "",
      IdempotencyKey: v4(),
    });
    setStep("not-started");
  };

  const handleCancelPayment = async () => {
    apiClient.CancelPaySession({
      PaymentSid: latestAapState?.Sid ?? "",
      CallSid: props.task?.attributes.call_sid ?? "",
      IdempotencyKey: v4(),
    });
    setStep("not-started");
  };

  return (
    <Theme.Provider theme="default">
      <Toaster {...toaster} />
      {props.task && step !== "not-displayed" ? (
        <Grid margin="space0">
          <Column span={12} gutter="space10" hidden={step !== "not-started"}>
            <InitForm handleSubmit={handleStartPayment}></InitForm>
          </Column>
          <Column span={12} gutter="space10" hidden={step !== "in-progress"}>
            <CreditCard
              creditCardNumber={latestAapState?.PaymentCardNumber}
              expiryDate={latestAapState?.ExpirationDate}
              securityCode={latestAapState?.SecurityCode}
              currentCapture={latestAapState?.Capture}
              captureInProgress={latestAapState?.PartialResult}
              hasError={
                [
                  "input-timeout",
                  "invalid-card-number",
                  "invalid-date",
                  "date-validation-failed",
                  "invalid-security-code",
                ].includes(latestAapState?.ErrorType ?? "")
                  ? true
                  : false
              }
            ></CreditCard>
          </Column>
          <Column span={12} gutter="space10" hidden={step !== "in-progress"}>
            <PayControlCentre
              onChangeCapture={handleChangeCapture}
              onCompletePayment={handleCompletePayment}
              onCancelPayment={handleCancelPayment}
              canComplete={latestAapState?.Required ?? "" === "" ? true : false}
            ></PayControlCentre>
          </Column>
          <Column
            span={2}
            offset={5}
            gutter="space10"
            hidden={step !== "loading"}
          >
            <Box>
              <Text as="p" textAlign="center">
                <Spinner
                  decorative={false}
                  title="Loading"
                  size="sizeIcon110"
                />
              </Text>
            </Box>
          </Column>
        </Grid>
      ) : (
        ""
      )}
    </Theme.Provider>
  );
};
export const PaymentUi = withTaskContext(paymentUiComponent);
