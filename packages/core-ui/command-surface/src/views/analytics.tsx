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
import { ButtonGroup, CircularProgress, Menu, Paper } from "@mui/material";
import { unit as mathUnit } from 'mathjs';
import { Box, Typography, IconButton, Button } from '@mui/material'
import { useParams } from "react-router-dom";
import { debounce } from 'lodash';
import { DeviceGraphExportModal } from "../components/modals/device-graph-export";
import saveAs from "file-saver";

const baseToBlob = (base64String, contentType = '') => {
  console.log(base64String)
  const byteCharacters : any = atob(base64String);
  const byteArrays: any[]= [];

  for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays.push(byteCharacters.charCodeAt(i));
  }

  const byteArray = new Uint8Array(byteArrays);
  return new Blob([byteArray], { type: contentType });
}

export type ReportHorizon = { start: Date, end: Date };

export interface ReportChart {
  id: string;
  label: string;

  x: number;
  y: number;
  width: number;
  height: number;

  totalValue: { total: any };
  values: { timestamp: any, value: any }[];

  xAxisDomain?: any;
  yAxisDomain?: any;

  unit: string;
}

export interface AnalyticViewProps {
  // addChart?: () => void;
  // startDate?: Date;
  // endDate?: Date;
  horizon?: ReportHorizon; // {start: Date, end: Date}
  onHorizonChange?: (horizon: ReportHorizon) => void;


  date?: Date;

  editable?: boolean;
}

export const AnalyticView: React.FC<AnalyticViewProps> = (props) => {

  const { activePage } = useParams();

  const { analytics, client, refresh, activeProgram } = useContext(DeviceControlContext);

  const [selected, setSelected] = useState<any>(null);

  const report_periods = ['7d', '1d', '12hr', '1hr', '30min']

  const [period, setPeriod] = useState<'7d' | '1d' | '12hr' | '1hr' | '30min'>('30min');
  const [datum, setDatum] = useState(props.date || new Date())

  const period_format = useMemo(() => {
    switch (period) {
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
    switch (period) {
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
    switch (period) {
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

  const [fetchHorizon, _setFetchHorizon] = useState<{ start: Date, end: Date }>(horizon)

  const setFetchHorizon = useMemo(() => debounce(_setFetchHorizon, 500), [])

  useEffect(() => {
    setFetchHorizon(horizon)
  }, [horizon])

  const { results, loading } = client?.useAnalyticValues?.(activePage || '', fetchHorizon) || {}

  const prevPeriod = () => {

    let newDatum = new Date(datum);

    switch (period) {
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

    switch (period) {
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


  const canNext = useMemo(() => {
    let newDatum = new Date(datum);
    let startOfPeriod : moment.Moment = moment(); 

    switch (period) {
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

    switch (period) {
      case '7d':
        startOfPeriod = moment(newDatum).startOf('isoWeek');
      case '1d':
        startOfPeriod = moment(newDatum).startOf('day');
      case '12hr':
        startOfPeriod = moment(newDatum).subtract(12, 'hours')
      case '1hr':
        startOfPeriod = moment(newDatum).startOf('hour');
      case '30min':
      default:
        startOfPeriod = moment(newDatum).subtract(30, 'minutes')
    }

    console.log(startOfPeriod, startOfPeriod.isBefore(moment()))

    return startOfPeriod.add(1, 'minute').isBefore(moment())

  }, [datum, period])

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
  const [ graphExportOpen, openGraphExport ] = useState(false);

  const charts = useMemo(() => {
    return (analytics?.find((a) => a.id == activePage)?.charts || []).map((chart) => {

      let chartValue = results?.find((a) => a.id === chart.id)

      return {
        ...chart,
        w: chart.width,
        h: chart.height,
        totalValue: chartValue?.totalValue,
        values: chartValue?.values?.map((value) => ({ ...value, timestamp: moment(value.timestamp).format('DD/MM hh:mma') }))
      }
    })

  }, [activePage, analytics, results]);

  return (
    <Box
      style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}
    >

      <DeviceGraphExportModal 
        open={graphExportOpen} 
        selected={selected}
        tags={activeProgram?.tags || []}
        types={activeProgram?.types || []}
        onSubmit={(startDate, endDate, bucket) => {
          if(activePage) client?.downloadAnalytic?.(activePage, selected?.id, startDate, endDate, bucket).then((data) => {
              const string = data?.data?.downloadCommandDeviceAnalytic

            saveAs(new Blob([string]), `${selected?.tag?.name}${selected?.subkey ? `.${selected?.subkey?.name}` : ''}-${moment(startDate).format('DD/MM/YYYY')}-${moment(endDate).format('DD/MM/YYYY')}.csv`)

          })
        }}
        onClose={() => {
          openGraphExport(false)
        }}/>

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

          if (!activePage) return;

          if (!graph.id) {
            console.log("Add chart", graph)
            client?.addChart?.(activePage, 'line-chart', graph.deviceID, graph.keyID, graph.unit, graph.timeBucket, 0, 0, 8, 6, graph.totalize, graph.xAxisDomain, graph.yAxisDomain).then(() => {
              openModal(false);
              console.log("Chart added");
              // refetchStructure?.()
              // refetchValues?.()
              setSelected(undefined)
            })
          } else {
            client?.updateChart?.(activePage, graph.id, 'line-chart', graph.deviceID, graph.keyID, graph.unit, graph.timeBucket, graph.x, graph.y, graph.w, graph.h, graph.totalize, graph.xAxisDomain, graph.yAxisDomain).then(() => {
              openModal(false);
              // refetchStructure?.()
              // refetchValues?.()
              setSelected(undefined)
            })
          }

        }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row' }}>
        <Box sx={{ display: 'flex', marginLeft: '6px', alignItems: 'center' }}>
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <IconButton
            onClick={prevPeriod}>
            <Previous />
          </IconButton>
          <Typography>{moment(horizon?.start)?.format(period_format)} - {moment(horizon?.end)?.format(period_format)}</Typography>
          <IconButton
            disabled={!canNext}
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
          overflow: 'auto',
          position: 'relative'
        }}>

        <Box sx={{ flex: 1, maxHeight: 0, '& .rgl': { minWidth: '100%' } }}>
          <GraphGrid

            onLayoutChange={(layout: any) => {
              if (!activePage) return;
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
                  if (!activePage) return;
                  client?.removeChart?.(activePage, item.id).then(() => {
                    // refetchStructure?.()
                  })
                }}
                onEdit={() => {
                  openModal(true);
                  setSelected(item)
                }}
                onExport={() => {
                  setSelected({...item, horizon})
                  openGraphExport(true)
                }}
                dataKey={item.subkey?.name}
                label={`${item.tag?.name} - ${item.subkey?.name}`}
                total={item?.totalValue?.total ? (item?.totalValue?.total + (item.unit ? mathUnit(item.unit).units?.[0]?.unit.name : '')) : ''}>
                <Graph xAxisDomain={item.xAxisDomain} yAxisDomain={item.yAxisDomain} data={item.values} xKey={"timestamp"} yKey={"value"} />
              </GraphContainer>
            )}
          </GraphGrid>
        </Box>
        {loading &&
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CircularProgress />
            <Typography>Fetching data...</Typography>
          </Box>}
      </Box>

    </Box>
  );
};
