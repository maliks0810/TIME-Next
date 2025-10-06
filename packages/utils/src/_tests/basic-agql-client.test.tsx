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

    type mockDocumentData = { user: { id: string } };
    type mockDocumentType = { name: string };

    const mockQueryDocument: TypedDocumentNode<mockDocumentData, mockDocumentType> = gql`
        query GetMockData($id: id!) {
            user(id: $id) { 
                id
            }
        }
    ` as TypedDocumentNode<mockDocumentData, mockDocumentType>;
 

    beforeEach(() => {
        cleanup();
        (useApolloClient as any).mockReturnValue({
            query: mockQueryFunction,
            mutation: mockMutationFunction
        });
        (useBearerToken as any).mockReturnValue(mockGetTokenFunction);
    });

    it('should execute a query when a token is not needed', async () => {
        const { result } = renderHook(() => useBasicGQLOperation());
        const mockQuery = result.current;

        const data = { data: { user: { id: 999 }}};
        mockQueryFunction.mockResolvedValue(data);

        const res = await mockQuery(mockQueryDocument, { id: 999}, false);
        expect(res).toEqual(data);
    });
})