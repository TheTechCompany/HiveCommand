import { BaseModal, FormControl } from "@hexhive/ui";
import { TextInput } from "grommet";
import React, { useState } from "react";

export const ControlGraphModal = (props) => {
  const [graph, setGraph] = useState<{
    deviceID?: string;
    keyID?: string;
  }>({});

  const onSubmit = () => {
    props.onSubmit(graph);
  };
  return (
    <BaseModal
      title="Control Graph"
      open={props.open}
      onSubmit={onSubmit}
      onClose={props.onClose}
    >
      <FormControl
        value={graph.deviceID}
        onChange={(value) => setGraph({ ...graph, deviceID: value })}
        options={props.devices || []}
        labelKey="name"
        placeholder="Select device"
      />
      <FormControl
        value={graph.keyID}
        onChange={(value) => setGraph({ ...graph, keyID: value })}
        options={
          props.devices?.find((item) => item.id == graph.deviceID)?.type
            .state || []
        }
        labelKey="key"
        placeholder="Select key"
      />
    </BaseModal>
  );
};
