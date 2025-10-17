import React, { createContext, useContext, useState } from "react";
import { isFunction, isNull, isPlainObject, isUndefined } from "lodash";

type AppProviderProps = {    
    children: React.ReactNode;
};

class GenericData{
    public data: object | string | number | boolean | null | undefined;

    constructor(data: object | string | number | boolean | null | undefined){
        this.data = data;
    }
}

const defaultGenericData = new GenericData(undefined);
const GenericDataContext = createContext(defaultGenericData);
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
// Function to validate that any input data to the context is not a function, and does not contain a function within an object
// First it checks if the input data is an object:
//      If an object it recursively loops through the object, switching the inputContainsFunction flag to be true and throws an error if true, or returns the data if false
// Then it checks if the input itself is not a function or undefined, if true it returns the data, if false throws and error
//
// Params:
// updatedData: GenericData - which must be either a string, number, object, null or boolean, the class allows for undefined however that is not an acceptable input as
// we use that for the default state 
//
// Returns: 
// Either returns the input data without any transformation if it passes all validation, or throws an error
export function validateData(updatedData: GenericData): GenericData{
    let inputContainsFunction = false;

    // eslint-disable-next-line
    function traverseObject(obj: any) {
        Object.keys(obj).forEach(key => {
            if(isFunction(obj[key]) || isUndefined(obj[key])){
                inputContainsFunction = true;            
            } else if (isPlainObject(obj[key]) && isNull(obj[key]) === false ){
                traverseObject(obj[key])
            } 
        });
    } 

    if(isPlainObject(updatedData)){
        try{
            traverseObject(updatedData);
            if (inputContainsFunction){
                throw new Error('Error updating Generic Data Context, Functions and Undefined Data are not supported, context value set to undefined')
            } else {
                return updatedData;
            }
        // eslint-disable-next-line
        } catch (e: any){
            if(e instanceof Error){
                throw new Error('Error updating Generic Data Context, Functions and Undefined Data are not supported, context value set to undefined')
            }else {
                console.log('')
            }
        }
    }
    if (isFunction(updatedData) === false && isUndefined(updatedData) === false) { 
        return(updatedData);
    } else {
        throw new Error('Error updating Generic Data Context, Functions and Undefined Data are not supported, context value set to undefined')
    }
}


// Summary:
// Returns a context which is used to wrap the application in App.tsx so that data can be passed up and down between components
// Usage:
// - In App.tsx import: import { GenericDataProvider } from '@platform/utils';
// - Wrap <AppRouter /> with the GenericDataProvider and data can pass between the inner components: 
// - <GenericDataProvider> <AppRouter /> </GenericDataProvider>
export function GenericDataProvider({ children }: AppProviderProps) {
    const [genericData, setGenericData] = useState<GenericData>(defaultGenericData);

    const validateContextData = (updatedData: GenericData) => {
        const data = validateData(updatedData);
        setGenericData(data)
    }   

    return (
        <GenericDataContext.Provider value={genericData}>
            <UpdateGenericDataContext value={validateContextData}>
                {children}
            </UpdateGenericDataContext>
        </GenericDataContext.Provider>
    )
}