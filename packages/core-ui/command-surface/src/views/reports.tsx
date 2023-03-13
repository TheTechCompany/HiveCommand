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
import { ButtonGroup, Menu, Paper } from "@mui/material";

import { Box, Typography, IconButton, Button} from '@mui/material'

export type ReportHorizon = {start: Date, end: Date};

export interface ReportChart {
  id: string;
  label: string;

  x: number;
  y: number;
  width: number;
  height: number;
  totalValue: {total: any};
  values: {timestamp: any, value: any}[];
}

export interface ReportViewProps {
  // addChart?: () => void;
  // startDate?: Date;
  // endDate?: Date;
  horizon?: ReportHorizon; // {start: Date, end: Date}
  onHorizonChange?: (horizon: ReportHorizon) => void;

  
  date?: Date;

  editable?: boolean;
}

export const ReportView: React.FC<ReportViewProps> = (props) => {

  const { reports, client, activePage, refresh, activeProgram } = useContext(DeviceControlContext);

  const [ selected, setSelected ] = useState();

  const report_periods = ['7d', '1d', '12hr', '1hr', '30min']

  const [ period, setPeriod ] = useState<'7d' | '1d' | '12hr' | '1hr' | '30min'>('30min');
  const [ datum, setDatum ] = useState(props.date || new Date())

  const period_format = useMemo(() => {
    switch(period){
      case '7d':
        return 'DD/MM/yy';
      case '1d':
        return 'hh:mma DD/MM'
      case '12hr':
      case '1hr':
      case '30min':
        return 'hh:mma'
    }
  }, [period])

  const startOfPeriod = useMemo(() => {
    switch(period){
      case '7d':
        return moment(datum).startOf('isoWeek');
      case '1d':
        return moment(datum).startOf('day');
      case '12hr':
        return moment(datum).subtract(12, 'hours')
      case '1hr':
        return moment(datum).startOf('hour');
      case '30min':
      default:
        return moment(datum).subtract(30, 'minutes')
    }
  }, [datum, period]);

  const endOfPeriod = useMemo(() => {
    switch(period){
      case '7d':
        return moment(datum).endOf('isoWeek');
      case '1d':
        return moment(datum).endOf('day');
      case '12hr':
        return moment(datum)
      case '1hr':
        return moment(datum).endOf('hour');
      case '30min':
      default:
        return moment(datum);
    }
  }, [datum, period]);

  const horizon = useMemo(() => {
    return {
      start: startOfPeriod?.toDate(),
      end: endOfPeriod?.toDate()
    }
  }, [startOfPeriod, endOfPeriod])


  const { results } = client?.useReportValues?.(activePage || '', horizon) || {}

  console.log("Report values", results)

  const prevPeriod = () => {
    
    let newDatum = new Date(datum);

    switch(period){
      case '7d':
        newDatum = moment(datum).subtract(1, 'week').toDate();
        break;
      case '1d':
        newDatum = moment(datum).subtract(1, 'day').toDate();
        break;
      case '12hr':
        newDatum = moment(datum).subtract(12, 'hours').toDate();
        break;
      case '1hr':
        newDatum = moment(datum).subtract(1, 'hour').toDate();
        break;
      case '30min':
        newDatum = moment(datum).subtract(30, 'minutes').toDate();
        break;
    }

    // let startDate = moment(horizon?.start).subtract(1, 'week').toDate();
    // let endDate = moment(horizon?.end).subtract(1, 'week').toDate();

    // props.onHorizonChange?.({start: startDate, end: endDate});

    setDatum(newDatum);

    // setDatum(moment(datum).subtract(1, 'week').toDate());
  }

  const nextPeriod = () => {

    let newDatum = new Date(datum);

    switch(period){
      case '7d':
        newDatum = moment(datum).add(1, 'week').toDate();
        break;
      case '1d':
        newDatum = moment(datum).add(1, 'day').toDate();
        break;
      case '12hr':
        newDatum = moment(datum).add(12, 'hours').toDate();
        break;
      case '1hr':
        newDatum = moment(datum).add(1, 'hour').toDate();
        break;
      case '30min':
        newDatum = moment(datum).add(30, 'minutes').toDate();
        break;
    }

    // let startDate = moment(horizon?.start).subtract(1, 'week').toDate();
    // let endDate = moment(horizon?.end).subtract(1, 'week').toDate();

    // props.onHorizonChange?.({start: startDate, end: endDate});

    setDatum(newDatum);

    // let startDate = moment(props.horizon?.start).add(1, 'week').toDate();
    // let endDate = moment(props.horizon?.end).add(1, 'week').toDate();

    // props.onHorizonChange?.({start: startDate, end: endDate});
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
    return (reports?.find((a) => a.id == activePage)?.charts || []).map((chart) => {

      let chartValue = results?.find((a) => a.id === chart.id)

      return {
        ...chart,
        w: chart.width,
        h: chart.height,
        totalValue: chartValue?.totalValue,
        values: chartValue?.values?.map((value) => ({...value, timestamp: moment(value.timestamp).format('DD/MM hh:mma') }))
      }
    })
  
  }, [activePage, reports, results]);

  return (
    <Box
      style={{position: 'relative', flex: 1, display: 'flex', flexDirection: 'column'}}
    >
      <ControlGraphModal
        open={modalOpen}
        selected={selected}
        tags={activeProgram?.tags || []}
        types={activeProgram?.types || []}
        onClose={() => {
          openModal(false);
          setSelected(undefined)
        }}
        onSubmit={(graph) => {

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
      <Box sx={{display: 'flex', justifyContent: 'space-between', flexDirection: 'row'}}>
        <Box sx={{display: 'flex', alignItems: 'center'}}>
          <ButtonGroup size="small">
            {report_periods.map((period_i) => (
              <Button 
                onClick={() => setPeriod(period_i as any)}
                variant={period === period_i ? 'contained' : undefined}>
                  {period_i}
              </Button>
            ))}
          </ButtonGroup>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1}}>
          <IconButton 
            onClick={prevPeriod}>
            <Previous />
          </IconButton>
          <Typography>{moment(horizon?.start)?.format(period_format)} - {moment(horizon?.end)?.format(period_format)}</Typography>
          <IconButton 
            onClick={nextPeriod}
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
            total={item?.totalValue?.total}>
              <Graph data={item.values} xKey={"timestamp"} yKey={"value"}  />
        </GraphContainer>
        )}
        </GraphGrid>
      </Box>

    </Box>
  );
};
