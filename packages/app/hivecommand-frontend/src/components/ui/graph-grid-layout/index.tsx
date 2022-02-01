import React, { useState } from "react";
import { Box, Text, Button } from "grommet";
import { Close } from "grommet-icons";
import RGL, {
  Responsive as ResponsiveReactGridLayout,
  WidthProvider,
} from "react-grid-layout";
import { Graph, GraphContainer } from "../graph";

import "/node_modules/react-grid-layout/css/styles.css";
import "/node_modules/react-resizable/css/styles.css";

const ReactGridLayout = WidthProvider(RGL);
// const ResponsiveReactGridLayout = WidthProvider(Responsive);

export interface GridLayout {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface GraphGridLayoutProps {
  onLayoutChange: (layout: GridLayout[]) => void;
  layout: GridLayout[];
}

export const GraphGridLayout: React.FC<GraphGridLayoutProps> = (props) => {
  const [layouts, setLayouts] = useState(null);
  const [widgetArray, setWidgetArray] = useState([]);

  const handleModify = (layouts, layout) => {
    const tempArray = widgetArray;
    setLayouts(layout);
    layouts?.map((position) => {
      tempArray[Number(position.i)].x = position.x;
      tempArray[Number(position.i)].y = position.y;
      tempArray[Number(position.i)].width = position.w;
      tempArray[Number(position.i)].height = position.h;
    });
    setWidgetArray(tempArray);
  };

  return (
    <div>
      {/* {props.children} */}
      <ReactGridLayout
        layout={props.layout}
        onLayoutChange={props.onLayoutChange}
        cols={12}
        rowHeight={30}
        width={1200}
        className="rgl"
      >
        {props.children}
      </ReactGridLayout>
    </div>
  ); //<div>{props.children}</div>;
};

// <RGL
//   onLayoutChange={props.onLayoutChange}
//   verticalCompact={true}
//   layout={props.layout}
//   breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
//   preventCollision={false}
//   cols={{ lg: 8, md: 8, sm: 4, xs: 2, xxs: 2 }}
//   autoSize={true}
//   margin={{
//     lg: [20, 20],
//     md: [20, 20],
//     sm: [20, 20],
//     xs: [20, 20],
//     xxs: [20, 20],
//   }}
// >
//   {props.children}
// </RGL>
