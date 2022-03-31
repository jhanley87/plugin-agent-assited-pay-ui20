import React from "react";
import CreditCard from "../CreditCard/CreditCard";
import { Grid, Column, Box } from "@twilio-paste/core";
import { Theme } from "@twilio-paste/core/theme";
interface OwnProps {
  // Props passed directly to the component
}

// Props should be a combination of StateToProps, DispatchToProps, and OwnProps
type Props = OwnProps;

// It is recommended to keep components stateless and use redux for managing states
const CustomTaskList: React.FunctionComponent<Props> = (props: Props) => {
  return (
    <Theme.Provider theme="default">
      <Grid margin="space0">
        <Column span={12} gutter="space10">
          <CreditCard></CreditCard>
        </Column>
      </Grid>
    </Theme.Provider>
  );
};

export default CustomTaskList;
