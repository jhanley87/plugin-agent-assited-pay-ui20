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

interface OwnProps {
    handleSubmit: (initFormValues: InitFormState) => void;
}

export interface InitFormState {
  description: string;
  amount: number;
  selectedTokenType: TokenTypeOption;
}

// Props should be a combination of StateToProps, DispatchToProps, and OwnProps
type Props = OwnProps;

// It is recommended to keep components stateless and use redux for managing states
export default class InitForm extends React.Component<Props, InitFormState> {
  constructor(props: Props) {
    super(props);
  }

  readonly tokenTypes: TokenTypeOption[] = [
    { label: "One Time", val: "one-time" },
    { label: "Reusable", val: "reusable" },
  ];

  readonly state: InitFormState = {
    description: "",
    amount: 0,
    selectedTokenType: this.tokenTypes[0],
  };

  onChange = (e: any) =>
    this.setState({ ...this.state, [e.target.name]: e.target.value });

  onTokenTypeChange = (val: any) => {
    this.setState({ ...this.state, selectedTokenType: val.selectedItem });
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
            items={this.tokenTypes}
            labelText="Type of payment"
            optionTemplate={(item) => <Text as="p">{item.label}</Text>}
            onSelectedItemChange={this.onTokenTypeChange}
            initialSelectedItem={this.state.selectedTokenType}
            itemToString={(item: TokenTypeOption) => {
              return item.label;
            }}
          />
        </Box>
        {this.state.selectedTokenType.val === "one-time" ? (
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
            Start Payment
          </Button>
        </Box>
      </Box>
    );
  }
}
