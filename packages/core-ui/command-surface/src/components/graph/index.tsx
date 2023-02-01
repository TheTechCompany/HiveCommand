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
}

const BaseGraph: React.FC<BaseGraphProps> = (props) => {

  return (
    <ResponsiveContainer>
      <LineChart
        margin={{ left: 0, top: 8, bottom: 8, right: 8 }}
        data={props.data?.map((x) => ({...x, [props.yKey || '']: typeof(x?.[props.yKey || '']) === "number" ? x?.[props.yKey || ''] : parseFloat(x?.[props.yKey || ''])}))}
      >
        <XAxis dataKey={props.xKey} angle={-45} tickMargin={40} height={85} />
        <YAxis dataKey={props.yKey} />
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
