import {
    TableCell,
    TableHead,
    TableRow,
} from "@mui/material";

const TradeTableHeader = ({ showActions }: { showActions: boolean }) => (
    <TableHead>
        <TableRow>
            <TableCell><b>Trade Date</b></TableCell>
            <TableCell><b>Portfolio</b></TableCell>
            <TableCell><b>CUSIP</b></TableCell>
            <TableCell><b>ISIN</b></TableCell>
            <TableCell><b>SEDOL</b></TableCell>
            <TableCell><b>Security Name</b></TableCell>
            <TableCell align="right">
                <b>Quantity</b>
            </TableCell>
            <TableCell><b>Broker Code</b></TableCell>
            <TableCell><b>Broker Name</b></TableCell>
            {showActions && (
                <TableCell align="center">
                    <b>Actions</b>
                </TableCell>
            )}
        </TableRow>
    </TableHead>
);

export default TradeTableHeader;