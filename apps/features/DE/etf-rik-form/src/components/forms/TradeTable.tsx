import React, {
    Fragment,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Paper,
    Table,
    TableBody,
    TableContainer,
    Typography,
    TableRow,
    TableCell
} from "@mui/material";

import { AllocationInputRow, OrderStatus } from "../../types/etfform";

import OrderGroupRow from "./order-group-row";
import TradeTableHeader from "./trade-table-header";
import AllocationRow from "./allocation-row";
import { getNextOrderId } from "../../utils/order-gen";


interface AllocationTableRow
    extends AllocationInputRow {
    rowIndex: number;
}

interface GroupedOrder {
    groupKey: string;
    orderId: string;
    status: OrderStatus;
    failedStep?: OrderStatus;
    rows: AllocationTableRow[];
}
interface Props {
    requestId: string;
    data: AllocationInputRow[];
    baseOrderId: number;
    canSubmit: boolean;
    isEditable: boolean;
    onEdit: (index: number) => void;
    onDelete: (index: number) => void;
    editIndex?: number | null;
    groupOrderMap: Record<string, string>;
    setGroupOrderMap: React.Dispatch<
        React.SetStateAction<Record<string, string>>
    >;
}

const TradeTable: React.FC<Props> = ({
    requestId,
    data,
    groupOrderMap,
    setGroupOrderMap,
    baseOrderId,
    isEditable,
    canSubmit,
    onEdit,
    onDelete,
    editIndex
}) => {
    const [collapsedOrders, setCollapsedOrders] =
        useState<Record<string, boolean>>({});

    const groupedOrders = useMemo<GroupedOrder[]>(() => {
        const groups = new Map<
            string,
            GroupedOrder
        >();

        const nextMap = { ...groupOrderMap };

        data.forEach((row, index) => {
            const groupKey = [
                row.tradeDate,
                row.portfolioNumber,
                row.broker
            ].join("|");

            if (!nextMap[groupKey]) {
                nextMap[groupKey] =
                    row.orderId ??
                    getNextOrderId(
                        baseOrderId.toString(),
                        Object.values(nextMap)
                    );
            }

            if (!groups.has(groupKey)) {
                groups.set(groupKey, {
                    groupKey,
                    orderId: nextMap[groupKey],
                    status:
                        row.orderStatus ?? "PENDING",
                    failedStep: row.failedStep,
                    rows: [] as AllocationTableRow[]
                });
            }

            groups.get(groupKey)?.rows.push({
                ...row,
                rowIndex: index
            });
        });

        const mapChanged =
            JSON.stringify(nextMap) !==
            JSON.stringify(groupOrderMap);

        if (mapChanged) {
            setTimeout(() => {
                setGroupOrderMap(nextMap);
            }, 0);
        }

        return Array.from(groups.values());
    }, [data, baseOrderId, groupOrderMap]);


    useEffect(() => {
        const activeGroupKeys = new Set(
            data.map(
                (row) =>
                    [
                        row.tradeDate,
                        row.portfolioNumber,
                        row.broker
                    ].join("|")
            )
        );

        setGroupOrderMap((prev) => {
            const next = { ...prev };

            Object.keys(next).forEach((key) => {
                if (!activeGroupKeys.has(key)) {
                    delete next[key];
                }
            });

            return next;
        });
    }, [data]);

    return (
        <TableContainer
            component={Paper}
            sx={{
                borderRadius: 2,
                maxHeight: 500
            }}
        >
            <Table
                stickyHeader
                size="small"
                sx={{
                    "& .MuiTableCell-root": {
                        py: 0.6,
                        px: 1,
                        fontSize: "0.75rem",
                        whiteSpace: "nowrap"
                    }
                }}
            >
                <TradeTableHeader showActions={canSubmit}/>

                <TableBody>
                    {groupedOrders.length > 0 ? (
                        groupedOrders.map((group) => (
                            <Fragment key={group.orderId}>
                                <OrderGroupRow
                                    requestId={requestId}
                                    orderId={group.orderId}
                                    status={group.status}
                                    failedStep={group.failedStep}
                                    canSubmit={canSubmit}
                                    collapsed={
                                        collapsedOrders[
                                        group.orderId
                                        ]
                                    }
                                    colSpan={
                                        isEditable ? 9 : 8
                                    }
                                    onToggle={() =>
                                        setCollapsedOrders(
                                            (prev) => ({
                                                ...prev,
                                                [group.orderId]:
                                                    !prev[
                                                    group
                                                        .orderId
                                                    ]
                                            })
                                        )
                                    }
                                />

                                {!collapsedOrders[
                                    group.orderId
                                ] &&
                                    group.rows.map(
                                        (row) => (
                                            <AllocationRow
                                                key={
                                                    row.rowIndex
                                                }
                                                row={row}
                                                isEditable={
                                                    isEditable
                                                }
                                                isEditing={
                                                    editIndex ===
                                                    row.rowIndex
                                                }
                                                onEdit={
                                                    onEdit
                                                }
                                                onDelete={
                                                    onDelete
                                                }
                                            />
                                        )
                                    )}
                            </Fragment>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={
                                    isEditable ? 9 : 8
                                }
                                align="center"
                            >
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    No allocations added yet
                                </Typography>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default TradeTable;