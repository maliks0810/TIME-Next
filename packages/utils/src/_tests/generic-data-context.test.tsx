/* eslint-disable */
import { expect, it, describe } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { GenericDataProvider, useGenericDataContext, useUpdateGenericDataContext } from '../hooks/Contexts/generic-data-context';
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

    it('should update the stored value when undefined is input as data', () => {
        const wrapper = ({ children }: {children: React.ReactNode }) => (
            <GenericDataProvider> {children} </GenericDataProvider>
        )

        const { result } = renderHook(() => useGenericData(), {wrapper});
        expect(result.current.data.data).toBeUndefined();

        act(() => {
            result.current.update({ data: undefined} );
        })
        expect(result.current.data.data).toBeUndefined();
    });
    
    it('should not update the stored value when undefined is input as undefined', () => {
        const wrapper = ({ children }: {children: React.ReactNode }) => (
            <GenericDataProvider> {children} </GenericDataProvider>
        )

        const { result } = renderHook(() => useGenericData(), {wrapper});
        expect(result.current.data.data).toBeUndefined();

        act(() => {
            result.current.update(undefined as any);
        })

        console.log(result.current.data)

        expect(result.current.data).toThrowError();
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

        act(() => {
            result.current.update({data: ()=>console.log('test')});
        });
        expect(result.current.update).toThrowError();
        expect(result.current.data).toBe(undefined);
    })
})
