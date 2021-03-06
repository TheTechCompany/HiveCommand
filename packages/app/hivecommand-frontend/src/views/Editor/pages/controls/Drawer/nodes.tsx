import { NodeDropdown } from "../../../../../components/node-dropdown";
import { Box } from "grommet";
import React from "react";

export const NodeMenu = (props) => {
    return (
        <Box flex pad="xsmall">
            <NodeDropdown
                items={props.nodes.map((node) => ({
                    ...node,
                    icon: node.icon
                }))}
            />
        </Box>
    )
}