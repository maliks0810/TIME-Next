import {
    Box,
    Typography,
    Button,
    Stack,
    TextField,
    IconButton,
    InputAdornment
} from "@mui/material"

import { useNavigate } from "react-router-dom";
import FormTable from "../components/grids/FormTable"
import { useCreateETFTransferRequest } from "../hooks/useETFTransfer";
import { useETFTransferRequests } from "../hooks/useETFTransfer";
import AddIcon from "@mui/icons-material/Add";
import { useUserInfo } from "@platform/utils";
import { useState } from "react";
import { useDebounce } from "../hooks/useDebounce";
import ClearIcon from "@mui/icons-material/Clear";
import { useUserAccess } from "../hooks/useUserAccess";
import { hasPermission } from "../utils/auth";

const FormListPage: React.FC = () => {
    const createForm = useCreateETFTransferRequest();
    const navigate = useNavigate();
    const userInfo = useUserInfo()
    const { data: access } = useUserAccess();
    const [search, setSearch] = useState("")
    const debouncedSearch = useDebounce(search, 500);
    const hasViewAll =  hasPermission(access ?? {}, "VIEWALL")
    const email = hasViewAll ? undefined : userInfo.email
    const { data = [] } = useETFTransferRequests(email, debouncedSearch);
    return (
        <Box p={3}>

            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
                sx={{
                    p: 2,
                    backgroundColor: "#ffffff",
                    borderRadius: 2,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
                }}
            >
                {/* LEFT SIDE */}
                <Box>
                    <Typography variant="h5" fontWeight={600}>
                        ETF RIK Forms
                    </Typography>

                    {/* Optional subtitle (very common in enterprise apps) */}
                    <Typography variant="body2" color="text.secondary">
                        Manage and track all submitted and draft forms
                    </Typography>
                </Box>

                {/* RIGHT SIDE */}
                <Stack direction="row" spacing={2}>
                    <TextField
                        size="small"
                        placeholder="Search by reference..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        slotProps={{
                            input: {
                                endAdornment: search && (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setSearch('')}>
                                            <ClearIcon color="error" fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }
                        }}
                        sx={{
                            minWidth: 250,
                            "& .MuiOutlinedInput-root": {
                                height: 40,
                                borderRadius: "10px",
                                backgroundColor: "#fff",
                                fontSize: 14,
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#d1d5db",
                            },
                        }}
                    />


                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() =>
                            createForm.mutate(userInfo.email, {
                                onSuccess: (data) => {
                                    navigate(`/de/redemption-in-kind/detail/${data.id}`);
                                }
                            })
                        }
                        sx={{
                            textTransform: "none",
                            fontWeight: 500,
                            borderRadius: 2,
                            px: 1.5
                        }}
                    >
                        Add Form
                    </Button>
                </Stack>
            </Box>


            <FormTable data={data} email={userInfo.email}></FormTable>
        </Box >

    )
};
export default FormListPage;