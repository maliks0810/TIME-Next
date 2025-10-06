/* eslint-disable */
import { describe, it, beforeEach, expect, vi } from "vitest";
import { useBasicGQLOperation } from "../hooks/basic-agql-client";
import { cleanup, renderHook } from "@testing-library/react";
import { gql, TypedDocumentNode } from "@apollo/client";
import { useApolloClient } from "@apollo/client/react";
import { useBearerToken } from "../hooks/bearer-token";

vi.mock('@apollo/client/react', () => ({
    useApolloClient: vi.fn()
}));

vi.mock('../hooks/bearer-token', () => ({
    useBearerToken: vi.fn()
}));

describe('useBasicGQLOperation', () => {

    const mockQueryFunction = vi.fn();
    const mockMutationFunction = vi.fn();
    const mockGetTokenFunction = vi.fn();
    const mockInvalidFunction = vi.fn();

    type mockDocumentData = { user: { id: string}};
    type mockDocumentType = { name: string };

    const mockQueryDocument: TypedDocumentNode<mockDocumentData, mockDocumentType> = gql`
        query GetMockData($id: id!) {
            user(id: $id) { 
                id
            }
        }
    ` as TypedDocumentNode<mockDocumentData, mockDocumentType>;
 
    const mockMutationDocument: TypedDocumentNode<mockDocumentData, mockDocumentType> = gql`
        mutation PostMockData($id: id!) {
            user(id: $id) { 
                id
            }
        }
    ` as TypedDocumentNode<mockDocumentData, mockDocumentType>;

    const mockInvalidDocument: TypedDocumentNode<mockDocumentData, mockDocumentType> = gql`
        subscription SubscribeMockData($id: id!) {
            user(id: $id) { 
                id
            }
        }
    ` as TypedDocumentNode<mockDocumentData, mockDocumentType>;

    beforeEach(() => {
        cleanup();
        (useApolloClient as any).mockReturnValue({
            query: mockQueryFunction,
            mutate: mockMutationFunction
        });
        (useBearerToken as any).mockReturnValue(mockGetTokenFunction);
    });

    it('should execute a query when a token is not needed', async () => {
        const { result } = renderHook(() => useBasicGQLOperation());
        const mockQuery = result.current;

        const data = { data: { user: { id: 999 }}};
        mockQueryFunction.mockResolvedValue(data);

        const res = await mockQuery(mockQueryDocument, data, false);
        expect(res).toEqual(data);
    });

    it('should execute a query when a token is needed', async () => {
        const { result } = renderHook(() => useBasicGQLOperation());
        const mockQuery = result.current;

        const data = { data: { user: { id: 999 }}};
        mockQueryFunction.mockResolvedValue(data);

        const res = await mockQuery(mockQueryDocument, data, true);
        expect(res).toEqual(data);
    });

    
    it('should execute a mutation when a token is needed', async () => {
        const { result } = renderHook(() => useBasicGQLOperation());
        const mockMutation = result.current;

        const data = { data: { user: { id: 999}}};
        mockMutationFunction.mockResolvedValue(data);

        const res = await mockMutation(mockMutationDocument, data , true);
        expect(res).toEqual(data)
    })

    it('should execute a mutation when a token is not needed', async() => {
        const { result } = renderHook(() => useBasicGQLOperation());
        const mockMutation = result.current;

        const data = { data: { user: { id: 999}}};
        mockMutationFunction.mockResolvedValue(data);

        const res = await mockMutation(mockMutationDocument, data, false);
        expect(res).toEqual(data)
    });


    it('should throw an error when the input docType is not a query or mutation', async () => {
        const { result } = renderHook(() => useBasicGQLOperation());
        const mockInvalid = result.current;

        const data = { data: { user: { id: 999 }}};
        mockInvalidFunction.mockResolvedValue(data);

        await expect(mockInvalid(mockInvalidDocument)).rejects.toThrow('operation document must be a query or a mutation');
    });

    it('should throw an error when a query fails', async () => {
        const mockError = new Error('error testing');
        const { result } = renderHook(() => useBasicGQLOperation());
        const mockQuery = result.current;

        mockQueryFunction.mockRejectedValue(mockError);

        await expect(mockQuery(mockQueryDocument)).rejects.toThrow('error testing');
    });

    it('should throw an error when a mutation fails', async () => {
        const mockError = new Error('error test');
        const { result } = renderHook(() => useBasicGQLOperation());
        const mockMutation = result.current;
        
        mockMutationFunction.mockRejectedValue(mockError);

        await expect(mockMutation(mockMutationDocument)).rejects.toThrow('error test');
    });
})