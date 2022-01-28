import React, { useMemo, useState, useContext } from "react";
import { Box, Button, Text } from "grommet";
import { Add } from "grommet-icons";
import { LineGraph } from "@hexhive/ui";
import { useQuery, gql } from "@apollo/client";
import { DeviceControlContext } from "../context";
import { ControlGraphModal } from "../../../components/modals/device-control-graph";
import { Graph, GraphContainer } from "../../../components/ui/graph";
import { GraphGridLayout } from "app/hivecommand-frontend/src/components/ui/graph-grid-layout";
import moment from "moment";

export const DeviceControlGraph: React.FC<any> = (props) => {
  const { controlId, program } = useContext(DeviceControlContext);

  const [dayBefore, setDayBefore] = useState<string>(
    new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  );

  const [deviceList, setDeviceList] = useState([]);

  const [deviceLayout, setDeviceLayout] = useState([]);

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

      let deviceTimeseries = `${queryName}:commandDeviceTimeseries(deviceId:$deviceId, startDate:$startDate, device:"${queryName}", valueKey:"${queryKey}"){
          timestamp
          value
  
        }
        `;
      let deviceTotal = "";
      if (graph.totalize) {
        deviceTotal = `
          ${queryName}Total:commandDeviceTimeseriesTotal(deviceId:$deviceId, startDate:$startDate, device:"${queryName}", valueKey:"${queryKey}"){
            total
          }
          `;
      }
      return `
      ${deviceTimeseries}
      ${deviceTotal}
      `;
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

      const value = data?.[device.name]?.map((item) => {
        let d = new Date(item.timestamp);
        let offset = (new Date().getTimezoneOffset() / 60) * -1;
        return {
          ...item,
          timestamp: moment(d).add(offset, "hours").format("ddd DD hh:mma "),
        };
      });

      const total = data?.[`${device.name}Total`]?.total;

      return {
        device,
        key,
        value,
        total,
      };
    });
  }, [deviceList, program, data]);

  const [modalOpen, openModal] = useState(false);

  console.log({ values, deviceLayout });

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
          const device = program.devices?.find(
            (item) => graph.deviceID == item.id
          );

          const key = device?.type.state.find(
            (item) => graph.keyID == item.id
          )?.key;

          openModal(false);
          setDeviceList([...deviceList, graph]);
          setDeviceLayout([
            ...deviceLayout,
            { i: `${device.name} - ${key}`, x: 0, y: 1, w: 8, h: 6 },
          ]);
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

      <GraphGridLayout
        onLayoutChange={(layout) => {
          setDeviceLayout(layout);
        }}
        layout={deviceLayout}
      >
        {values.map((graph, ix) => (
          <div
            key={`${graph.device.name} - ${graph.key}`}
            style={{ display: "flex" }}
          >
            <GraphContainer
              dataKey={`${graph.device.name} - ${graph.key}`}
              total={graph.total}
              onRemove={() => {
                let arr = deviceList.slice();
                arr.splice(ix, 1);
                setDeviceList(arr);
              }}
              label={`${graph.device.name} - ${graph.key}`}
            >
              <Graph data={graph.value} xKey={"timestamp"} yKey={"value"} />
            </GraphContainer>
          </div>
        ))}
      </GraphGridLayout>
    </Box>
  );
};
