import React from "react";
import { Box, Text, Grid, Column, Button } from "@twilio-paste/core";
import { Theme } from "@twilio-paste/core/theme";

import {
  creditCardBaseStyles,
  logoStyles,
  blinkText,
} from "./CreditCard.Styles";
import { PayCaptureParameter } from "common/PayCaptureParameter";
interface OwnProps {
  // Props passed directly to the component
  creditCardNumber?: string;
  expiryDate?: string;
  securityCode?: string;
  currentCapture?: PayCaptureParameter;
  captureInProgress?: boolean
  hasError: boolean
}

interface CreditCardState {}

// Props should be a combination of StateToProps, DispatchToProps, and OwnProps
type Props = OwnProps;

// It is recommended to keep components stateless and use redux for managing states
export default class CreditCard extends React.Component<
  Props,
  CreditCardState
> {
  constructor(props: Props) {
    super(props);
  }

  readonly state: CreditCardState = {
    enteringSecurityCode: false,
  };

  cardNumberFormatted = () => {
    if (!this.props.creditCardNumber || this.props.creditCardNumber === "") return "**** **** **** ****";
    const formatted = this.props.creditCardNumber.match(/.{1,4}/g);
    return formatted?.join(" ");
  };

  expiryDateFormatted = () => {
    if (!this.props.expiryDate || this.props.expiryDate === "") return "**/**";
    const formatted = this.props.expiryDate.match(/.{1,2}/g);
    return formatted?.join("/");
  };

  securityCodeFormatted = () => {
    if (!this.props.securityCode || this.props.securityCode === "") return "***";
    return this.props.securityCode;
  };

  render() {
    return (
      <Grid gutter="space30">
        <Column span={6} gutter="space10">
          <Box
            className={`${creditCardBaseStyles}`}
            margin="space20"
            borderRadius="borderRadius30"
          >
            <Box>
              <img
                className={logoStyles}
                src="https://docs.smooch.io/images/channel-header-logos/logo_twilio_white.png"
              />
            </Box>
            <Box>
              <Text
                as="p"
                fontSize="fontSize80"
                padding="space70"
                fontFamily="fontFamilyCode"
                color={this.props.hasError && this.props.currentCapture === "payment-card-number"  ? "colorTextErrorStrong" : "colorTextInverse"}
                className={
                  this.props.currentCapture && this.props.currentCapture === "payment-card-number" && this.props.captureInProgress
                    ? blinkText
                    : ""
                }
                key={this.props.currentCapture}
              >
                {this.cardNumberFormatted()}
              </Text>
            </Box>
            <Box>
              <Text
                as="p"
                fontSize="fontSize40"
                padding="space70"
                fontFamily="fontFamilyCode"
                color={this.props.hasError && this.props.currentCapture === "expiration-date"  ? "colorTextErrorStrong" : "colorTextInverse"}
                className={
                  this.props.currentCapture && this.props.currentCapture === "expiration-date" && this.props.captureInProgress
                    ? blinkText
                    : ""
                }
              >
                Expiry: {this.expiryDateFormatted()}
              </Text>
            </Box>
          </Box>
        </Column>
        <Column span={6} gutter="space10">
          <Box
            className={creditCardBaseStyles}
            margin="space20"
            borderRadius="borderRadius30"
          >
            <Box padding="space60"></Box>
            <Box
              padding="space60"
              backgroundColor="colorBackgroundDarkest"
            ></Box>
            <Box
              padding="space20"
              backgroundColor="colorBackgroundBody"
              margin="space20"
              width="75%"
            >
              <Text
                as="p"
                textAlign="right"
                color={this.props.hasError && this.props.currentCapture === "security-code"  ? "colorTextErrorStrong" : "colorText"}
                className={
                  this.props.currentCapture && this.props.currentCapture === "security-code" && this.props.captureInProgress ? blinkText : ""
                }
              >
                {this.securityCodeFormatted()}
              </Text>
            </Box>
          </Box>
        </Column>
        <Column
          className={`${creditCardBaseStyles} `}
          span={12}
          gutter="space10"
        ></Column>
      </Grid>
    );
  }
}
