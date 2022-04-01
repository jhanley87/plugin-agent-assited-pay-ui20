import React from "react";
import { Box, Stack, Button, Grid, Column } from "@twilio-paste/core";
import { PayCaptureParameter } from "common/PayCaptureParameter";

interface OwnProps {
  handleChangeCapture: (paramToCapture: PayCaptureParameter) => void;
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
    this.props.handleChangeCapture("payment-card-number");
  };
  handleCaptureExpiry = () => {
    this.props.handleChangeCapture("expiration-date");
  };
  handleCaptureSecurityCode = () => {
    this.props.handleChangeCapture("security-code");
  };

  render() {
    return (
      <Box padding="space30">
        <Grid gutter="space20">
          <Column span={3}>
            <Button
              variant="secondary"
              onClick={this.handleCaptureCardNumber}
              fullWidth
            >
              Capture Card Number
            </Button>
          </Column>
          <Column span={3}>
            <Button
              variant="secondary"
              onClick={this.handleCaptureExpiry}
              fullWidth
            >
              Capture Expiry
            </Button>
          </Column>
          <Column span={3}>
            <Button
              variant="secondary"
              onClick={this.handleCaptureSecurityCode}
              fullWidth
            >
              Capture Security Code
            </Button>
          </Column>
          <Column span={3}>
            <Button
              variant="primary"
              disabled={this.props.canComplete}
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
