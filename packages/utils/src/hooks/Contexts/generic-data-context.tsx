import React, { createContext, useContext, useState } from "react";

type AppProviderProps = {    
    children: React.ReactNode;
};

type GenericData = {
    data: unknown;
}

const defaultGenericData: GenericData = { data: undefined };
const GenericDataContext = createContext<GenericData>(defaultGenericData);
const UpdateGenericDataContext = createContext<(data: GenericData) => void>((i) => i);

export function useGenericDataContext() {
    return useContext(GenericDataContext);
};

export function useUpdateGenericDataContext() {
    return useContext(UpdateGenericDataContext);
}

export function GenericDataProvider({ children }: AppProviderProps) {
    const [genericData, setGenericData] = useState<GenericData>(defaultGenericData);

    return (
        <GenericDataContext.Provider value={genericData}>
            <UpdateGenericDataContext value={setGenericData}>
                {children}
            </UpdateGenericDataContext>
        </GenericDataContext.Provider>
    )
}