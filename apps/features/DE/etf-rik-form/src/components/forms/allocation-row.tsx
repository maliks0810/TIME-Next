import {
    TableRow,
    TableCell,
    IconButton
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";


import { AllocationInputRow } from "../../types/etfform";

interface AllocationRowProps {
    row: AllocationInputRow & {
        rowIndex: number;
    };

    isEditable: boolean;
    isEditing: boolean;

    onEdit: (index: number) => void;
    onDelete: (index: number) => void;
}

const AllocationRow = ({
    row,
    isEditable,
    isEditing,
    onEdit,
    onDelete
}: AllocationRowProps) => {
    return (
        <TableRow
            hover
            sx={{
                backgroundColor:
                    isEditing
                        ? "#E3F2FD"
                        : "inherit"
            }}
        >
            <TableCell>{row.tradeDate}</TableCell>
            <TableCell>{row.portfolioNumber}</TableCell>
            <TableCell>{row.cusip}</TableCell>
            <TableCell>{row.isin}</TableCell>
            <TableCell>{row.sedol}</TableCell>

            <TableCell>
                {row.securityName}
            </TableCell>

            <TableCell align="right">
                {Number(
                    row.quantity
                ).toLocaleString()}
            </TableCell>

            <TableCell>{row.broker}</TableCell>
            <TableCell>{row.brokerName}</TableCell>

            {isEditable && (
                <TableCell align="center">
                    <IconButton
                        size="small"
                        onClick={() =>
                            onEdit(row.rowIndex)
                        }
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>

                    <IconButton
                        size="small"
                        color="error"
                        onClick={() =>
                            onDelete(row.rowIndex)
                        }
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </TableCell>
            )}
        </TableRow>
    );
};

export default AllocationRow;