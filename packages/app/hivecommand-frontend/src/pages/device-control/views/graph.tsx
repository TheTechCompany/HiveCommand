import React, { useMemo, useState, useContext } from "react";
import { Box, Button, Text } from "grommet";
import { Add } from "grommet-icons";
import { GridLayoutItem, LineGraph } from "@hexhive/ui";
import { useQuery, gql } from "@apollo/client";
import { DeviceControlContext } from "../context";
import { ControlGraphModal } from "../../../components/modals/device-control-graph";
import { useAddDeviceChart, useUpdateDeviceChart, useRemoveDeviceChart, useUpdateDeviceChartGrid } from '@hive-command/api'
import { GraphGrid } from '@hexhive/ui'
// import { Graph, GraphContainer } from "../../../components/ui/graph";

// import { GraphGridLayout } from "app/hivecommand-frontend/src/components/ui/graph-grid-layout";
import moment from "moment";
import { Graph } from "../../../components/ui/graph";

export const DeviceControlGraph: React.FC<any> = (props) => {
  const { reporting, controlId, refresh, program } = useContext(DeviceControlContext);

  const [dayBefore, setDayBefore] = useState<string>(
    new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  );

  const [deviceList, setDeviceList] = useState([]);

  const [deviceLayout, setDeviceLayout] = useState<GridLayoutItem[]>([]);

  const { data } = useQuery(
    gql`
      query TimeSeriesData {
	
		commandDevices{ id } 
		${reporting.map((graph) => {
      
			const queryName = graph.templateDevice?.name;
			const queryKey = graph.templateKey?.key;
		
      let deviceTimeseries = `${queryName}:commandDeviceTimeseries(deviceId:"${controlId}", startDate:"${dayBefore}", device:"${queryName}", valueKey:"${queryKey}"){
          timestamp
          value
  
        }
        `;
      let deviceTotal = "";
      if (graph.total) {
        deviceTotal = `
          ${queryName}Total:commandDeviceTimeseriesTotal(deviceId:"${controlId}", startDate:"${dayBefore}", device:"${queryName}", valueKey:"${queryKey}"){
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
       
    `);

	const addChart = useAddDeviceChart(controlId)
	const updateChart = useUpdateDeviceChart(controlId)
	const updateChartGrid = useUpdateDeviceChartGrid(controlId)
	const removeChart = useRemoveDeviceChart(controlId);

  console.log("Render", {reporting});

  const values = useMemo(() => {
    return reporting.map((graph) => {

    //   const device = program.devices?.find((item) => graph.deviceID == item.id);

    //   const key = device?.type.state.find(
    //     (item) => graph.keyID == item.id
    //   )?.key;

      const value = data?.[graph.templateDevice.name]?.map((item) => {
        let d = new Date(item.timestamp);
        let offset = (new Date().getTimezoneOffset() / 60) * -1;
        return {
          ...item,
          timestamp: moment(d).add(offset, 'hours').format("DD/MM hh:mma "),
        };
      });

      const total = data?.[`${graph.templateDevice.name}Total`]?.total;

      return {
		  ...graph,
		  label: `${graph.templateDevice.name} - ${graph.templateKey.key}`,
		  values: value,
		  total: total ?  parseFloat(total).toFixed(2) : undefined
      };
    });
  }, [reporting, program, data]);

  const [modalOpen, openModal] = useState(false);

  console.log({ reporting });

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

			addChart('line-chart', graph.deviceID, graph.keyID, 0, 0, 8, 6, graph.totalize).then(() => {
				openModal(false);
				refresh?.()
			})
        //   const device = program.devices?.find(
        //     (item) => graph.deviceID == item.id
        //   );

        //   const key = device?.type.state.find(
        //     (item) => graph.keyID == item.id
        //   )?.key;

        //   setDeviceList([...deviceList, graph]);
        //   setDeviceLayout([
        //     ...deviceLayout,
        //     { id: `${device.name} - ${key}`, x: 0, y: 1, w: 8, h: 6 },
        //   ]);
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

	  <GraphGrid 
		onRemoveItem={(item) => {
			removeChart(item.id).then(() => {
				refresh?.()
			})
		}}
	  	onLayoutChange={(layout) => {
			updateChartGrid(layout.map((x) => ({
				...x,
				id: x.i
			})));

			// console.log(layout)
		}}
	  	layout={values}
		  >
		{(item: any) => (
			<Box flex>
				<Graph data={item.values} xKey={"timestamp"} yKey={"value"}  />
			</Box>
		)}
	  </GraphGrid>
{/* 
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
      </GraphGridLayout> */}
    </Box>
  );
};
