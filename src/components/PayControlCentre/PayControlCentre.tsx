import React from "react";
import { Box, Stack, Button, Grid, Column } from "@twilio-paste/core";
import { PayCaptureParameter } from "common/PayCaptureParameter";

interface OwnProps {
  onChangeCapture: (paramToCapture: PayCaptureParameter) => void;
  onCompletePayment: () => void;
  onCancelPayment: () => void;
  canComplete: boolean;
}

export interface PayControlCentreState {
  currentCapture: string;
}

// Props should be a combination of StateToProps, DispatchToProps, and OwnProps
type Props = OwnProps;

// It is recommended to keep components stateless and use redux for managing states
export default class InitForm extends React.Component<
  Props,
  PayControlCentreState
> {
  constructor(props: Props) {
    super(props);
  }

  readonly state: PayControlCentreState = {
    currentCapture: "",
  };

  handleCaptureCardNumber = () => {
    this.props.onChangeCapture("payment-card-number");
  };
  handleCaptureExpiry = () => {
    this.props.onChangeCapture("expiration-date");
  };
  handleCaptureSecurityCode = () => {
    this.props.onChangeCapture("security-code");
  };

  handleCancelPayment = () => {
    this.props.onCancelPayment();
  };
  handleCompletePayment = () => {
    this.props.onCompletePayment();
  };

  render() {
    return (
      <Box padding="space30">
        <Grid gutter="space20" equalColumnHeights>
          <Column span={2} offset={1}>
            <Button
              variant="secondary"
              onClick={this.handleCaptureCardNumber}
              fullWidth
            >
              Capture Card Number
            </Button>
          </Column>
          <Column span={2}>
            <Button
              variant="secondary"
              onClick={this.handleCaptureExpiry}
              fullWidth
            >
              Capture Expiry
            </Button>
          </Column>
          <Column span={2}>
            <Button
              variant="secondary"
              onClick={this.handleCaptureSecurityCode}
              fullWidth
            >
              Capture Security Code
            </Button>
          </Column>
          <Column span={2}>
            <Button
              variant="primary"
              onClick={this.handleCancelPayment}
              fullWidth
            >
              Cancel
            </Button>
          </Column>
          <Column span={2}>
            <Button
              variant="primary"
              disabled={this.props.canComplete}
              onClick={this.handleCompletePayment}
              fullWidth
            >
              Complete
            </Button>
          </Column>
        </Grid>
      </Box>
    );
  }
}
