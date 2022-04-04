import React from "react";
import {
  Box,
  Text,
  Button,
  Label,
  TextArea,
  Input,
  Combobox,
} from "@twilio-paste/core";

interface TokenTypeOption {
  label: string;
  val: "one-time" | "reusable";
}

interface PaySessionType {
  label: string;
  val: "payment" | "tokenisation";
}

interface OwnProps {
  handleSubmit: (initFormValues: InitFormState) => void;
}

export interface InitFormState {
  description: string;
  amount: number;
  selectedTokenType: TokenTypeOption;
  selectedPaySessionType: PaySessionType;
}

// Props should be a combination of StateToProps, DispatchToProps, and OwnProps
type Props = OwnProps;

// It is recommended to keep components stateless and use redux for managing states
export default class InitForm extends React.Component<Props, InitFormState> {
  constructor(props: Props) {
    super(props);
  }

  readonly tokenTypes: TokenTypeOption[] = [
    { label: "Reusable", val: "reusable" },
    { label: "One Time", val: "one-time" },
  ];

  readonly paySessionTypes: PaySessionType[] = [
    { label: "Payment", val: "payment" },
    { label: "Tokenisation", val: "tokenisation" },
  ];

  readonly state: InitFormState = {
    description: "",
    amount: 0,
    selectedTokenType: this.tokenTypes[0],
    selectedPaySessionType: this.paySessionTypes[0],
  };

  onChange = (e: any) =>
    this.setState({ ...this.state, [e.target.name]: e.target.value });

  onTokenTypeChange = (val: any) => {
    this.setState({ ...this.state, selectedTokenType: val.selectedItem });
  };

  onPaySessionTypeChange = (val: any) => {
    this.setState({ ...this.state, selectedPaySessionType: val.selectedItem });
  };

  handleSubmit = () => {
    //Do some validation
    this.props.handleSubmit(this.state);
  };

  render() {
    return (
      <Box padding="space30">
        <Box padding="space20">
          <Combobox
            items={this.paySessionTypes}
            labelText="Capture payment for"
            optionTemplate={(item) => <Text as="p">{item.label}</Text>}
            onSelectedItemChange={this.onPaySessionTypeChange}
            initialSelectedItem={this.state.selectedPaySessionType}
            itemToString={(item: TokenTypeOption) => {
              return item.label;
            }}
          />
        </Box>
        {this.state.selectedPaySessionType.val === "tokenisation" ? (
          <Box padding="space20">
            <Combobox
              items={this.tokenTypes}
              labelText="Type of token"
              optionTemplate={(item) => <Text as="p">{item.label}</Text>}
              onSelectedItemChange={this.onTokenTypeChange}
              initialSelectedItem={this.state.selectedTokenType}
              itemToString={(item: TokenTypeOption) => {
                return item.label;
              }}
            />
          </Box>
        ) : (
          ""
        )}
        {this.state.selectedPaySessionType.val === "payment" ? (
          <Box>
            <Box padding="space20">
              <Label htmlFor="description" required>
                Description
              </Label>
              <TextArea
                onChange={this.onChange}
                id="description"
                name="description"
                placeholder="This is a payment for some shoes"
                required
              />
            </Box>
            <Box padding="space20">
              <Label htmlFor="amount" required>
                Amount
              </Label>
              <Input
                type="number"
                onChange={this.onChange}
                aria-describedby="message_help_text"
                id="amount"
                name="amount"
                placeholder="99.99"
                insertBefore={<Text as="p">£</Text>}
                required
              />
            </Box>
          </Box>
        ) : (
          ""
        )}
        <Box padding="space20">
          <Button variant="primary" onClick={this.handleSubmit} fullWidth>
            Start
          </Button>
        </Box>
      </Box>
    );
  }
}
