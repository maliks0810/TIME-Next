import React, { useEffect, useMemo } from "react";
import {
    Autocomplete,
    TextField,
    CircularProgress,
} from "@mui/material";
import { useDebounce } from "../../hooks/useDebounce";
import { useInfiniteSecurities } from "../../hooks/useSecurities";
import { SecurityOption } from "../../types/security";

import ClearIcon from "@mui/icons-material/Clear";
import IconButton from "@mui/material/IconButton";

interface Props {
    value?: string;
    portfolio?: string;
    inputValue?: string | null;
    setInputValue: (val: string) => void;
    onChange?: (option: SecurityOption | null) => void;
    error?: boolean;
    resetVersion: number
    helperText?: string;
}

export default function SecuritySelector({
    value,
    portfolio,
    inputValue,
    setInputValue,
    onChange,
    error,
    resetVersion,
    helperText,
}: Props) {

    const debouncedSearch = useDebounce(inputValue, 300);
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
    } = useInfiniteSecurities(debouncedSearch ?? '', portfolio);

    // ✅ ENTERPRISE RESET HANDLING
    useEffect(() => {
        setInputValue("");
    }, [resetVersion])

    const options = useMemo(
        () => data?.pages.flatMap((p) => p.data) ?? [],
        [data]
    );

    // ✅ map stored cusip → selected option
    const selectedOption =
        options.find((o: SecurityOption) => o.aladdin_id === value) || null;

    const handleScroll = (event: React.UIEvent<HTMLUListElement>) => {
        const listbox = event.currentTarget;

        if (
            listbox.scrollTop + listbox.clientHeight >=
            listbox.scrollHeight - 10 &&
            hasNextPage &&
            !isFetchingNextPage
        ) {
            fetchNextPage();
        }
    };
    return (
        <Autocomplete
            size="small"
            options={options}
            value={selectedOption}
            inputValue={inputValue ?? ''}
            loading={isFetching}
            filterOptions={(x) => x} // ✅ server-side only
            isOptionEqualToValue={(opt, val) => opt.aladdin_id === val.aladdin_id}
            getOptionLabel={(option) =>
                `${option.ticker} (${option.aladdin_id})`
            }
            getOptionKey={(opt) => opt.aladdin_id}
            onChange={(_, option) => {
                onChange?.(option);
            }}
            onInputChange={(_, value) => {
                setInputValue(value); // only search text
            }}
            ListboxProps={{ onScroll: handleScroll }}
            clearOnBlur={false}
            noOptionsText={"No securities found"}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Ticker / Cusip"
                    error={error}
                    helperText={helperText}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {value && (
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            onChange?.(null);
                                            setInputValue("");
                                        }}
                                    >
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                )}

                                {(isFetching || isFetchingNextPage) && (
                                    <CircularProgress size={18} />
                                )}

                                {params.InputProps.endAdornment}
                            </>
                        )
                    }}
                />
            )}
        />
    );
}