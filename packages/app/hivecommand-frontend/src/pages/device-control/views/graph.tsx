import React, { useMemo, useState, useContext } from "react";
import { Box, Button, Text } from "grommet";
import { Add } from "grommet-icons";
import { LineGraph } from "@hexhive/ui";
import { useQuery, gql } from "@apollo/client";
import moment from "moment-timezone";
import { DeviceControlContext } from "../context";
import { ControlGraphModal } from "../../../components/modals/device-control-graph";
import { Graph, GraphContainer } from "../../../components/ui/graph";

export const DeviceControlGraph: React.FC<any> = (props) => {
  const { controlId, program } = useContext(DeviceControlContext);

  const [dayBefore, setDayBefore] = useState<string>(
    new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  );

  const [deviceList, setDeviceList] = useState([]);

  const { data } = useQuery(
    gql`
      query TimeSeriesData(
        $deviceId: String
        $startDate: String
      ) {
	commandDevices{name}

		${deviceList.map((graph) => {
      const queryName = program.devices?.find(
        (item) => graph.deviceID == item.id
      )?.name;

      const queryKey = program.devices
        ?.find((item) => graph.deviceID == item.id)
        ?.type.state.find((item) => graph.keyID == item.id)?.key;

      return `${queryName}:commandDeviceTimeseries(deviceId:$deviceId, startDate:$startDate, device:"${queryName}", valueKey:"${queryKey}"){
				timestamp
				value

			}`;
    })}
	}
       
    `,
    {
      variables: {
        deviceId: controlId,
        startDate: dayBefore,
      },
    }
  );

  console.log("Render", data);

  const values = useMemo(() => {
    return deviceList.map((graph) => {
      const device = program.devices?.find((item) => graph.deviceID == item.id);

      const key = device?.type.state.find(
        (item) => graph.keyID == item.id
      )?.key;

      const value = data?.[device.name];

      return {
        device,
        key,
        value,
      };
    });
  }, [deviceList, program, data]);

  const [modalOpen, openModal] = useState(false);

  return (
    <Box
      pad="xsmall"
      flex
      gap="xsmall"
      background="light-1"
      elevation="small"
      round="xsmall"
    >
      <ControlGraphModal
        open={modalOpen}
        devices={program.devices}
        onClose={() => {
          openModal(false);
        }}
        onSubmit={(graph) => {
          openModal(false);
          setDeviceList([...deviceList, graph]);
        }}
      />
      <Box justify="end" direction="row">
        <Button
          onClick={() => openModal(true)}
          icon={<Add size="small" />}
          plain
          style={{ padding: 6, borderRadius: 3 }}
          hoverIndicator
        />
      </Box>

      <Box gap="xsmall" flex direction="row" wrap>
        {values.map((graph, ix) => (
          <GraphContainer
            onRemove={() => {
              let arr = deviceList.slice();
              arr.splice(ix, 1);
              setDeviceList(arr);
            }}
            label={`${graph.device.name} - ${graph.key}`}
          >
            <Graph data={graph.value} xKey={"timestamp"} yKey={"value"} />
          </GraphContainer>
        ))}
      </Box>
    </Box>
  );
};
