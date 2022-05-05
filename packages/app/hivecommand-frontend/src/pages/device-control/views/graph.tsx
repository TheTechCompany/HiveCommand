import React, { useMemo, useState, useContext, useEffect } from "react";
import { Box, Button, Text } from "grommet";
import { Add, Previous, Next } from "grommet-icons";
import { DateSelector, GridLayoutItem, LineGraph } from "@hexhive/ui";
import { useQuery, gql } from "@apollo/client";
import { DeviceControlContext } from "../context";
import { ControlGraphModal } from "../../../components/modals/device-control-graph";
import { useAddDeviceChart, useUpdateDeviceChart, useRemoveDeviceChart, useUpdateDeviceChartGrid } from '@hive-command/api'
import { GraphGrid } from '@hexhive/ui'
// import { Graph, GraphContainer } from "../../../components/ui/graph";

// import { GraphGridLayout } from "app/hivecommand-frontend/src/components/ui/graph-grid-layout";
import moment from "moment";
import { Graph } from "../../../components/ui/graph";
import { useApolloClient } from "@apollo/client";
import { LoadingIndicator } from "../../../components/LoadingIndicator";

export const DeviceControlGraph: React.FC<any> = (props) => {
  const { reporting, controlId, refresh, program } = useContext(DeviceControlContext);

  const [datum, setDatum] = useState(new Date())
  const startOfWeek = moment(datum).startOf('isoWeek');
  const endOfWeek = moment(datum).endOf('isoWeek');

  const prevWeek = () => {
    setDatum(moment(datum).subtract(1, 'week').toDate());
  }

  const nextWeek = () => {
    setDatum(moment(datum).add(1, 'week').toDate());
  }



  // const [dayBefore, setDayBefore] = useState<string>(
  //   new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  // );

  const [deviceList, setDeviceList] = useState([]);

  const [deviceLayout, setDeviceLayout] = useState<GridLayoutItem[]>([]);

  const client = useApolloClient()

  const { data, loading } = useQuery(gql`
    query ReportData($id: ID, $startDate: DateTime) {

      commandDevices(where: {id: $id}){

        reports {
          id
          x
          y
          width
          height

          total

          device {
              id
              name
          }
          dataDevice {
              id
              name
          }
          dataKey {
              id
              key
          }

          values (startDate: $startDate) {
            timestamp
            value
          }
        }
      }
    }
  `, {
    variables: {
      id: controlId,
      startDate: startOfWeek.toISOString()
    }
  })
 

	const addChart = useAddDeviceChart(controlId)
	const updateChart = useUpdateDeviceChart(controlId)
	const updateChartGrid = useUpdateDeviceChartGrid(controlId)
	const removeChart = useRemoveDeviceChart(controlId);

  console.log("Render", {reporting});

  useEffect(() => {
      const timer = setInterval(() => {
          client.refetchQueries({ include: ['ReportData'] })
      }, 5 * 1000)

      return () => {
          clearInterval(timer)
      }
  }, [])

  const values = (data?.commandDevices?.[0]?.reports || []).map((report) => ({
    ...report,
    w: report.width,
    h: report.height,
    label: `${report.dataDevice?.name} - ${report.dataKey?.key}`,
    values: report.values?.map((value) => ({
      ...value,
      timestamp: moment(value.timestamp).format("DD/MM hh:mma")
    })),
    total: report.totalValue
  }))


  const [modalOpen, openModal] = useState(false);

  return (
    <Box
      pad="xsmall"
      flex
      gap="xsmall"
      background="light-1"
      elevation="small"
      round="xsmall"
      style={{position: 'relative'}}

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
        
        }}
      />
      <Box justify="end" direction="row">
        <Box direction="row" align="center" justify="center" flex>
          <Button 
            onClick={prevWeek}
            plain 
            style={{padding: 6, borderRadius: 3}} 
            hoverIndicator 
            icon={<Previous size="small" />} />
          <Text>{startOfWeek.format('DD/MM/yy')} - {endOfWeek.format('DD/MM/yy')}</Text>
          <Button 
            onClick={nextWeek}
            plain 
            style={{padding: 6, borderRadius: 3}} 
            hoverIndicator 
            icon={<Next size="small" />} />

        </Box>
        <Button
          onClick={() => openModal(true)}
          icon={<Add size="small" />}
          plain
          style={{ padding: 6, borderRadius: 3 }}
          hoverIndicator
        />
      </Box>
    <Box 
      flex 
      overflow='auto'>
      {loading && <LoadingIndicator />}
      <GraphGrid 
        onRemoveItem={(item) => {
          // alert("Remove" + item.id)
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
    </Box>
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
