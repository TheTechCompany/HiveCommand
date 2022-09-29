import { NodeDropdown } from "../../../../../components/node-dropdown";
import { Box } from "grommet";
import React, { useMemo } from "react";

export const NodeMenu = (props) => {


    const items = useMemo(() => {
        return props.nodes.reduce((prev, curr) => {
            return prev.concat((curr.elements || []).map((x) => ({...x, pack: curr})));
        }, [])
    }, [props.nodes])

    return (
        <Box flex pad="xsmall">
            <NodeDropdown
                items={items.map((node) => ({
                    // extras: {
                    //     icon: <></>,
                    // },
                    group: node.pack.name,
                    extras: {
                        id: node.id,
                        name: node.name,
                        pack: node.pack.id
                    },
                    icon: <></>,
                    label: node.name,
                    ...node,
                    // icon: <></>,
                    // icon: node.icon
                }))}
            />
        </Box>
    )
}