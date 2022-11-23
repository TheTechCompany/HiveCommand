import React, { useMemo, useState, useContext, useEffect } from "react";
import { Box, Button, Text } from "grommet";
// import { useQuery, gql } from "@apollo/client";
import { DeviceControlContext } from "../context";
import { ControlGraphModal } from "../components/modals/device-control-graph";
// import { useAddDeviceChart, useUpdateDeviceChart, useRemoveDeviceChart, useUpdateDeviceChartGrid } from '@hive-command/api'
import { GraphGrid } from '@hexhive/ui'
// import { Graph, GraphContainer } from "../../../components/ui/graph";

// import { GraphGridLayout } from "app/hivecommand-frontend/src/components/ui/graph-grid-layout";
import moment from "moment";
import { Graph, GraphContainer } from "../components/graph";
// import { useApolloClient } from "@apollo/client";
import { LoadingIndicator } from "../components/LoadingIndicator";
import { MoreVert, KeyboardArrowDown as Down, NavigateBefore as Previous, Add, NavigateNext as Next } from "@mui/icons-material";
import { Menu, Paper } from "@mui/material";

export const DeviceControlGraph: React.FC<any> = (props) => {

  const { refresh, program } = useContext(DeviceControlContext);

  const [ selected, setSelected ] = useState();

  const [datum, setDatum] = useState(new Date())
  const startOfWeek = moment(datum).startOf('isoWeek');
  const endOfWeek = moment(datum).endOf('isoWeek');

  const prevWeek = () => {
    setDatum(moment(datum).subtract(1, 'week').toDate());
  }

  const nextWeek = () => {
    setDatum(moment(datum).add(1, 'week').toDate());
  }

  const [deviceList, setDeviceList] = useState([]);

  // const [deviceLayout, setDeviceLayout] = useState<GridLayoutItem[]>([]);

  // const client = useApolloClient()

  // const { data } = useQuery(gql`
  //   query ReportData($id: ID) {

  //     commandDevices(where: {id: $id}){

  //       reports {
  //         id
  //         x
  //         y
  //         width
  //         height

  //         total

  //         device {
  //             id
  //             name
  //         }
  //         dataDevice {
  //             id
  //             name
  //         }
  //         dataKey {
  //             id
  //             key
  //         }

      
  //       }
  //     }
  //   }
  // `, {
  //   variables: {
  //     id: controlId,
  //     startDate: startOfWeek.toISOString()
  //   }
  // })
 
  // const { data: reportData, loading } = useQuery(gql`
  //   query ReportDataValue($id: ID, $startDate: DateTime){
  //     commandDevices(where: {id: $id}){
        
  //       reports {
  //         id
  //         totalValue(startDate: $startDate) {
  //           total
  //         }
  //         values (startDate: $startDate){
  //           timestamp
  //           value
  //         }
  //       }
  //     }
  //   }
  // `, {
  //   variables: {
  //     id: controlId,
  //     startDate: startOfWeek.toISOString()
  //   }
  // })

	const addChart : any= () => {}; //useAddDeviceChart(controlId)
	const updateChart : any=() => {}; //useUpdateDeviceChart(controlId)
	const updateChartGrid: any =() => {}; // useUpdateDeviceChartGrid(controlId)
	const removeChart: any = () => {}; //useRemoveDeviceChart(controlId);


  // const refetchValues = () => {
  //   client.refetchQueries({include: ['ReportDataValue']})
  // }
  // const refetchStructure = () => {
  //   client.refetchQueries({include: ["ReportData"]})
  // }


  // useEffect(() => {
  //     const timer = setInterval(() => {
  //       refetchValues()
  //     }, 5 * 1000)

  //     return () => {
  //         clearInterval(timer)
  //     }
  // }, [])

  const values = []
  
  // (data?.commandDevices?.[0]?.reports || []).map((report: any) => {

  //   let reportValue = reportData?.commandDevices?.[0]?.reports?.find((a: {id: string}) => a.id == report.id);

  //   return {
  //     ...report,
  //     w: report.width,
  //     h: report.height,
  //     label: `${report.dataDevice?.name} - ${report.dataKey?.key}`,
  //     values: reportValue?.values?.map((value: any) => ({
  //       ...value,
  //       timestamp: moment(value.timestamp).format("DD/MM hh:mma")
  //     })),
  //     total: reportValue?.totalValue?.total
  //   }
  // })


  const [modalOpen, openModal] = useState(false);

  return (
    <Box
      style={{position: 'relative', flex: 1, display: 'flex', flexDirection: 'column'}}
    >
      <ControlGraphModal
        open={modalOpen}
        selected={selected}
        devices={program?.devices || []}
        onClose={() => {
          openModal(false);
          setSelected(undefined)
        }}
        onSubmit={(graph) => {
          if(!graph.id){
            addChart('line-chart', graph.deviceID, graph.keyID, 0, 0, 8, 6, graph.totalize).then(() => {
              openModal(false);
              // refetchStructure?.()
              // refetchValues?.()
              setSelected(undefined)
            })
          }else{
            updateChart(graph.id, 'line-chart', graph.deviceID, graph.keyID, graph.x, graph.y, graph.w, graph.h, graph.totalize).then(() => {
              openModal(false);
              // refetchStructure?.()
              // refetchValues?.()
              setSelected(undefined)
            })
          }
        
        }}
      />
      <Box justify="end" direction="row">
        <Box direction="row" align="center" justify="center" flex>
          <Button 
            onClick={prevWeek}
            plain 
            style={{padding: 6, borderRadius: 3}} 
            hoverIndicator 
            icon={<Previous />} />
          <Text>{startOfWeek.format('DD/MM/yy')} - {endOfWeek.format('DD/MM/yy')}</Text>
          <Button 
            onClick={nextWeek}
            plain 
            style={{padding: 6, borderRadius: 3}} 
            hoverIndicator 
            icon={<Next />} />

        </Box>
        <Button
          onClick={() => openModal(true)}
          icon={<Add  />}
          plain
          style={{ padding: 6, borderRadius: 3 }}
          hoverIndicator
        />
      </Box>
    <Box 
      flex 
      overflow='auto'>
      {/* {loading && <LoadingIndicator />} */}
      <GraphGrid 
       
        onLayoutChange={(layout: any) => {
          updateChartGrid(layout.map((x: any) => ({
            ...x,
            id: x.i
          }))).then(() => {
            // refetchStructure?.()
          });

        // console.log(layout)
      }}
        noWrap
        layout={values}
        >
      {(item: any) => (
       <GraphContainer
          onDelete={() => {
            removeChart(item.id).then(() => {
              // refetchStructure?.()
            })
          }}
          onEdit={() => {
            openModal(true);
            setSelected(item)
          }}
          dataKey={item.dataKey?.key}
          label={`${item.dataDevice?.name} - ${item.dataKey?.key}`}
          total={item.total}>
            <Graph data={item.values} xKey={"timestamp"} yKey={"value"}  />
      </GraphContainer>
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
