import { describe, it, beforeEach } from "vitest"
import { cleanup } from "@testing-library/react";


describe('useBasicGQLOperation', () => {
    beforeEach(() => {
        cleanup();
    })

    it('should throw an error if the input docType is not query or mutation', () => {
        //todo
    });
    
    it('should populate operationOptions with the input variables', () => {
        //todo
    });
    it('should populate operationOptions with the correct bearer token', () => {
        //todo
    });
    it('should send a query when docType is query', () => {
        //todo
    });
    it('should send a mutation when docType is mutation', () => {
        //todo
    });
    it('should reutrn the raw response when successful', () => {
        //todo
    });
    it('should return the error on failure', () => {
        //todo
    });
})