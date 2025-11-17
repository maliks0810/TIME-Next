import axios, { AxiosInstance } from 'axios';
import { createContext, ReactNode, useCallback, useContext, useRef } from 'react';
import { useBearerToken } from '@platform/utils';

const ModelCatalogAxiosContext = createContext<() => AxiosInstance>(null!);

export const useModelCatalogAxiosContext = () => useContext(ModelCatalogAxiosContext);

export const ModelCatalogAxiosContextProvider = (props: { children: ReactNode }) => {
    const { children } = props;
    const instance = useRef<AxiosInstance>(null);
    const getToken = useBearerToken();
    const getInstance = useCallback((): AxiosInstance => {
        if (!instance.current) {
            instance.current = axios.create({
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            instance.current.interceptors.request.use(async (config) => {
                config.headers.Authorization = await getToken();
                return config;
            });
        }

        return instance.current;
    }, [getToken]);

    return (
        <ModelCatalogAxiosContext.Provider value={getInstance}>
            {children}
        </ModelCatalogAxiosContext.Provider>
    );
};
