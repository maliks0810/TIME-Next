import { expect, it, describe } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGenericDataContext, useUpdateGenericDataContext } from '../../src/hooks/Contexts/generic-data-context';

describe('useGenericDataContext', () => {
    it('should return undefined by default', () => {
        const { result } = renderHook(() => useGenericDataContext());
        expect(result.current.data).toBeUndefined();
    });
})

describe('useUpdateGenericDataContext', () => {
    it('should update the stored value when a number is input', () => {
        const { result } = renderHook(() => useUpdateGenericDataContext());
        const data = result.current(123);
        expect(data).toBe(123);
    });
    it('should update the stored value when a string is input', () => {
        const { result } = renderHook(() => useUpdateGenericDataContext());
        const data = result.current('test');
        expect(data).toBe('test');
    });
    it('should update the stored avlue when a custom object is input', () => {
        const { result } = renderHook(() => useUpdateGenericDataContext());
        const data = result.current({data: {name: 'testname', id: 123}})
        expect(data).toStrictEqual({data: {name: 'testname', id: 123}});
    })
})
