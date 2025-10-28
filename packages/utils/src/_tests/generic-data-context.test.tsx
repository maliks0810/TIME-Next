/* eslint-disable */
import { expect, it, describe } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { GenericDataProvider, useGenericDataContext, useUpdateGenericDataContext, validateData } from '../hooks/Contexts/generic-data-context';
import React from 'react'

function useGenericData() {
    const data = useGenericDataContext();
    const update = useUpdateGenericDataContext();
    return { data, update };
}

describe('useGenericDataContext', () => {
    it('provides undefined by default', () => {
        const wrapper = ({ children }: {children: React.ReactNode }) => (
            <GenericDataProvider> {children} </GenericDataProvider>
        )

        const { result } = renderHook(() => useGenericData(), {wrapper});
        expect(result.current.data.data).toBeUndefined();
    })
});

describe('useUpdateGenericDataContext',() => {
    it('should update the stored value when a number is input', () => {
        const wrapper = ({ children }: {children: React.ReactNode }) => (
            <GenericDataProvider> {children} </GenericDataProvider>
        )

        const { result } = renderHook(() => useGenericData(), {wrapper});
        expect(result.current.data.data).toBeUndefined();

        act(() => {
            result.current.update({ data: 123});
        })
        expect(result.current.data.data).toBe(123);
    });

    it('should update the stored value when a string is input', () => {
        const wrapper = ({ children }: {children: React.ReactNode }) => (
            <GenericDataProvider> {children} </GenericDataProvider>
        )

        const { result } = renderHook(() => useGenericData(), {wrapper});
        expect(result.current.data.data).toBeUndefined();

        act(() => {
            result.current.update({ data: 'test'});
        })
        expect(result.current.data.data).toBe('test')
    });

    it('should update the stored value when a custom object is input', () => {
        const wrapper = ({ children }: {children: React.ReactNode }) => (
            <GenericDataProvider> {children} </GenericDataProvider>
        )

        const { result } = renderHook(() => useGenericData(), {wrapper});
        expect(result.current.data.data).toBeUndefined();

        act(() => {
            result.current.update({ data: { name: 'testname', id: 999}});
        })
        expect(result.current.data.data).toStrictEqual({ name: 'testname', id: 999})
    });

    it('should throw an error when undefined is input as data', () => {
        const wrapper = ({ children }: {children: React.ReactNode }) => (
            <GenericDataProvider> {children} </GenericDataProvider>
        )

        const { result } = renderHook(() => useGenericData(), {wrapper});
        expect(result.current.data.data).toBeUndefined();
        expect(() => result.current.update({ data: undefined})).toThrow();
    });
    
    it('should not update the stored value when undefined is input as undefined', () => {
        const wrapper = ({ children }: {children: React.ReactNode }) => (
            <GenericDataProvider> {children} </GenericDataProvider>
        )

        const { result } = renderHook(() => useGenericData(), {wrapper});
        expect(result.current.data.data).toBeUndefined();

        expect(() => {result.current.update(undefined as any)}).toThrowError();
    });

    it('should update the stored value when null is input', () => {
        const wrapper = ({ children }: {children: React.ReactNode }) => (
            <GenericDataProvider> {children} </GenericDataProvider>
        )

        const { result } = renderHook(() => useGenericData(), {wrapper});
        expect(result.current.data.data).toBeUndefined();

        act(() => {
            result.current.update({ data: null} );
        })
        expect(result.current.data.data).toBeNull();
    });

    it('should update the stored value when an array is input', () => {
        const wrapper = ({ children }: {children: React.ReactNode }) => (
            <GenericDataProvider> {children} </GenericDataProvider>
        )

        const testArray = [1, 2, 3];

        const { result } = renderHook(() => useGenericData(), {wrapper});
        expect(result.current.data.data).toBeUndefined();

        act(() => {
            result.current.update({ data: testArray} );
        })
        expect(result.current.data.data).toEqual([1, 2, 3]);
    });

    it('should update the stored value when a boolean is input', () => {
        const wrapper = ({ children }: {children: React.ReactNode }) => (
            <GenericDataProvider> {children} </GenericDataProvider>
        )

        const { result } = renderHook(() => useGenericData(), {wrapper});
        expect(result.current.data.data).toBeUndefined();

        act(() => {
            result.current.update({ data: false} );
        })
        expect(result.current.data.data).toBe(false);
    });

    it('should hold the last updated value when changed multiple times', () => {
        const wrapper = ({ children }: {children: React.ReactNode }) => (
            <GenericDataProvider> {children} </GenericDataProvider>
        )

        const { result } = renderHook(() => useGenericData(), {wrapper});
        expect(result.current.data.data).toBeUndefined();

        act(() => {
            result.current.update({ data: null});
            result.current.update({ data: 9});
            result.current.update({ data: 'test'});
            result.current.update({ data: { name: 'test'}});
            result.current.update({ data: 123});
        })
        expect(result.current.data.data).toBe(123);
    });

    it('should update the stored value when a nested object is input', () => {
        const wrapper = ({ children }: {children: React.ReactNode }) => (
            <GenericDataProvider> {children} </GenericDataProvider>
        )

        const { result } = renderHook(() => useGenericData(), {wrapper});
        expect(result.current.data.data).toBeUndefined();

        act(() => {
            result.current.update({ data: {
                people: [   
                    {name: 'test', id: 1},
                    {name: 'testtwo', id: 2},
                    {name: 'testthree', id: 3, isAdmin: true},
                    {name: 'testfour', projects: ['abc', 'def']}
                ]
            }});
        })

        const expectedData = {
            people: [   
                {name: 'test', id: 1},
                {name: 'testtwo', id: 2},
                {name: 'testthree', id: 3, isAdmin: true},
                {name: 'testfour', projects: ['abc', 'def']}
            ]
        }

        expect(typeof result.current.data.data).toBe('object');
        expect(result.current.data.data).toEqual(expectedData);
    });

    it('should throw an error when a function is input', async () => {
        const wrapper = ({ children }: {children: React.ReactNode }) => (
            <GenericDataProvider> {children} </GenericDataProvider>
        )

        const { result } = renderHook(() => useGenericData(), {wrapper});
        expect(result.current.data.data).toBeUndefined();

        function test(){
            console.log(1+1)
        }

        expect(() => result.current.update(test as any)).toThrow();
    });
});

describe('validateData', () => {
    it('should return the data if a string is passed', () => {  
        const result = validateData({ data: 'test' });  
        expect(result).toStrictEqual({ data: 'test' });  
    });  

    it('should return the data if an integer is input', () => {
        const result = validateData({ data: 123 });  
        expect(result).toStrictEqual({ data: 123 });  
    });

    it('should return the data if null is input', () => {
        const result = validateData({ data: null });  
        expect(result).toStrictEqual({ data: null });  
    });

    it('should return the data if an object, not containing a function, is input', () => {
        const { result } = renderHook(() => validateData({ data: { nested: 'test'}}));
        expect(result.current).toStrictEqual({ data: { nested: 'test'}});
    });

    it('should throw an error if an object containing a function is input', () => {  
        expect(() => validateData({ data: { test: () => console.log('test') } })).toThrowError(  
            'Error updating Generic Data Context, Functions and Undefined Data are not supported, context value set to undefined'  
        );  
    });  
  
    it('should throw an error if a function is input', () => {  
        expect(() => validateData(console.log('test') as any)).toThrowError(  
            'Error updating Generic Data Context, Functions and Undefined Data are not supported, context value set to undefined'  
        );  
    });  
});
