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

// Summary:
// Returns function containing any data stored in the context, defaults to undefined and can be updated with useUpdateGenericDataContext();
// Usage:  
// Import the function: import { useGenericDataContext } from "@platform/utils"; 
// - Create a variable in your component -> const {variable_name} = useGenericDataContext(); 
// - Now use the data anywhere within the component as {variable_name}.data
export function useGenericDataContext() {
    return useContext(GenericDataContext);
};

// Summary:
// Returns function containing functionality to update the data contained in the context
// Usage:  
// - Import the function: import { useUpdateGenericDataContext } from "@platform/utils"; 
// - Create a variable in your component -> const {variable_name} = useUpdateGenericDataContext(); 
// - Within the function you can now {variable_name}({ data: {your_data} })
// - The data in {your_data} can be anything, an object, string, number, array etc.
export function useUpdateGenericDataContext() {
    return useContext(UpdateGenericDataContext);
}

// Summary:
// Returns a context which is used to wrap the application in App.tsx so that data can be passed up and down between components
// Usage:
// - In App.tsx import: import { GenericDataProvider } from '@platform/utils';
// - Wrap <AppRouter /> with the GenericDataProvider and data can pass between the inner components: 
// - <GenericDataProvider> <AppRouter /> </GenericDataProvider>
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