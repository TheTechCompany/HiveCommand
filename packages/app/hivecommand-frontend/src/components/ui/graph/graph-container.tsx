import React from "react";
import { Box, Text } from "grommet";
import { Graph } from ".";

export const GraphContainer = (props) => {
  return (
    <Box
      background="neutral-1"
      flex
      elevation="small"
      round="xsmall"
      width={{ min: "medium" }}
    >
      <Box direction="row" pad={{ horizontal: "small" }} justify="between">
        <Text>{props.label}</Text>
      </Box>
      {props.children}
    </Box>
  );
};
