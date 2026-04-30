import '@testing-library/jest-dom/vitest'

Object.defineProperty(import.meta, 'env', {  
  value: {  
    VITE_LOGGING_INGRESS_URL: 'http://mock-logging-url',  
    // add other env vars your code expects here  
  },  
});