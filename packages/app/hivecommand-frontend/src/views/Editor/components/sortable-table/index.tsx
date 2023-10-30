import { Table, TableBody, TableContainer, TableHead } from "@mui/material";
import { DndContext } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import React from "react";

export interface SortableTableProps {
    items?: any;
    primaryKey?: string | ((item: any) => string)
}

export const SortableTable : React.FC<SortableTableProps> = (props) => {

    const { items = [], primaryKey } = props;

    const getPk = (item: any) => {
        return typeof(primaryKey) == 'string' ? item[primaryKey] : primaryKey?.(item)
    }

    return (
        <DndContext>
            <SortableContext items={items?.map(getPk)}>
                <TableContainer>
                    <Table>
                        <TableHead>

                        </TableHead>
                        <TableBody>

                        </TableBody>
                    </Table>
                </TableContainer>
            </SortableContext>
        </DndContext>
    )
}