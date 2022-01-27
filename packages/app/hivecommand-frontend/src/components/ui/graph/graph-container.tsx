import React from "react";
import { Box, Text, Button } from "grommet";
import { Close } from "grommet-icons";
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
      <Box direction="row" pad={"xsmall"} justify="between">
        <Text>{props.label}</Text>
        <Button
          onClick={props.onRemove}
          icon={<Close size="small" />}
          plain
          style={{ padding: 6, borderRadius: 3 }}
          hoverIndicator
        />
      </Box>
      <Box flex> {props.children}</Box>
    </Box>
  );
};
