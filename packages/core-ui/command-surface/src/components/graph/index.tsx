import React from "react";

import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
} from "recharts";

export * from "./graph-container";

export interface BaseGraphProps {
  className?: string;

  data?: Array<any>;

  xKey?: string;
  yKey?: string;

  xAxisDomain?: any;
  yAxisDomain?: any;
}

const BaseGraph: React.FC<BaseGraphProps> = (props) => {

  const xAxisDomain = props.xAxisDomain?.map((domain) => {
    try{
      let val = parseFloat(domain)
      if(isNaN(val)) return domain;
      return val;
    }catch(e){
      return domain;
    }
  })

  const yAxisDomain = props.yAxisDomain?.map((domain) => {
    try{
      let val = parseFloat(domain)
      if(isNaN(val)) return domain;
      return val;
    }catch(e){
      return domain;
    }
  })

  console.log({xAxisDomain, yAxisDomain})

  return (
    <ResponsiveContainer>
      <LineChart
        margin={{ left: 0, top: 8, bottom: 8, right: 8 }}
        data={props.data?.map((x) => ({...x, [props.yKey || '']: typeof(x?.[props.yKey || '']) === "number" ? x?.[props.yKey || ''] : parseFloat(x?.[props.yKey || ''])}))}
      >
        <XAxis domain={xAxisDomain} dataKey={props.xKey} angle={-45} tickMargin={40} height={85} />
        <YAxis domain={yAxisDomain} dataKey={props.yKey} />
        <Tooltip />
        <CartesianGrid stroke="#f5f5f5" />
        <Line
          type="monotone"
          dataKey={props.yKey}
          stroke="#ff7300"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const Graph = BaseGraph
