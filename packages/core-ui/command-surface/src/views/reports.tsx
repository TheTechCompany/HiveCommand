import React, { useMemo, useState, useContext, useEffect } from "react";
// import { useQuery, gql } from "@apollo/client";
import { DeviceControlContext } from "../context";
import { ControlGraphModal } from "../components/modals/device-control-graph";
import { GraphGrid } from '@hexhive/ui'
// import { Graph, GraphContainer } from "../../../components/ui/graph";

// import { GraphGridLayout } from "app/hivecommand-frontend/src/components/ui/graph-grid-layout";
import moment from "moment";
import { Graph, GraphContainer } from "../components/graph";
// import { useApolloClient } from "@apollo/client";
import { MoreVert, KeyboardArrowDown as Down, NavigateBefore as Previous, Add, NavigateNext as Next } from "@mui/icons-material";
import { Menu, Paper } from "@mui/material";

import { Box, Typography, IconButton, Button} from '@mui/material'

export type ReportHorizon = {start: Date, end: Date};

export interface ReportChart {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  values: {timestamp: any, value: any}[];
}

export interface ReportViewProps {
  // addChart?: () => void;
  // startDate?: Date;
  // endDate?: Date;
  horizon?: ReportHorizon; // {start: Date, end: Date}
  onHorizonChange?: (horizon: ReportHorizon) => void;

  

  editable?: boolean;
}

export const ReportView: React.FC<ReportViewProps> = (props) => {

  const { reports, client, activePage, refresh, program } = useContext(DeviceControlContext);

  const [ selected, setSelected ] = useState();

  // const [datum, setDatum] = useState(props.date || new Date())

  const prevWeek = () => {
    
    let startDate = moment(props.horizon?.start).subtract(1, 'week').toDate();
    let endDate = moment(props.horizon?.end).subtract(1, 'week').toDate();

    props.onHorizonChange?.({start: startDate, end: endDate});

    // setDatum(moment(datum).subtract(1, 'week').toDate());
  }

  const nextWeek = () => {
    let startDate = moment(props.horizon?.start).add(1, 'week').toDate();
    let endDate = moment(props.horizon?.end).add(1, 'week').toDate();

    props.onHorizonChange?.({start: startDate, end: endDate});
    // setDatum(moment(datum).add(1, 'week').toDate());
  }

  const [deviceList, setDeviceList] = useState([]);

  // const [deviceLayout, setDeviceLayout] = useState<GridLayoutItem[]>([]);

  // const client = useApolloClient()



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


  const charts = useMemo(() => {
    return (reports?.find((a) => a.id == activePage)?.charts || []).map((chart) => ({
      ...chart,
      w: chart.width,
      h: chart.height
    }))
  }, [activePage, reports]);

  console.log("REPORTS", charts)

  return (
    <Box
      style={{position: 'relative', flex: 1, display: 'flex', flexDirection: 'column'}}
    >
      <ControlGraphModal
        open={modalOpen}
        selected={selected}
        tags={program?.tags || []}
        types={program?.types || []}
        onClose={() => {
          openModal(false);
          setSelected(undefined)
        }}
        onSubmit={(graph) => {
          console.log("Graph", {activePage, graph})
          if(!activePage) return;

          if(!graph.id){
            console.log("Add chart")
            client?.addChart?.(activePage, 'line-chart', graph.deviceID, graph.keyID, 0, 0, 8, 6, graph.totalize).then(() => {
              openModal(false);
              console.log("Chart added");
              // refetchStructure?.()
              // refetchValues?.()
              setSelected(undefined)
            })
          }else{
            client?.updateChart?.(activePage, graph.id, 'line-chart', graph.deviceID, graph.keyID, graph.x, graph.y, graph.w, graph.h, graph.totalize).then(() => {
              openModal(false);
              // refetchStructure?.()
              // refetchValues?.()
              setSelected(undefined)
            })
          }
        
        }}
      />
      <Box sx={{display: 'flex', justifyContent: 'flex-end', flexDirection: 'row'}}>
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1}}>
          <IconButton 
            onClick={prevWeek}>
            <Previous />
          </IconButton>
          <Typography>{moment(props.horizon?.start)?.format('DD/MM/yy')} - {moment(props.horizon?.end)?.format('DD/MM/yy')}</Typography>
          <IconButton 
            onClick={nextWeek}
          >
            <Next />
          </IconButton>

        </Box>
        <IconButton
          onClick={() => openModal(true)}>
          <Add />
        </IconButton>
      </Box>
      <Box 
        sx={{
          flex: 1,
          display: 'flex',
          overflow: 'auto'
        }}>
        <GraphGrid 
        
          onLayoutChange={(layout: any) => {
            if(!activePage) return;
            client?.updateChartGrid?.(activePage, layout.map((x: any) => ({
              ...x,
              id: x.i
            }))).then(() => {
              // refetchStructure?.()
            });
        }}
          noWrap
          layout={charts}
          >
        {(item: any) => (
        <GraphContainer
            onDelete={() => {
              if(!activePage) return;
              client?.removeChart?.(activePage, item.id).then(() => {
                // refetchStructure?.()
              })
            }}
            onEdit={() => {
              openModal(true);
              setSelected(item)
            }}
            dataKey={item.subkey?.name}
            label={`${item.tag?.name} - ${item.subkey?.name}`}
            total={item.total}>
              <Graph data={item.values} xKey={"timestamp"} yKey={"value"}  />
        </GraphContainer>
        )}
        </GraphGrid>
      </Box>

    </Box>
  );
};
