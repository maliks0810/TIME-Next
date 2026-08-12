import { BASE_API } from "./endpoints";
import axiosClient from "./axios"

export type UserAccess = Record<string, string[]>;

const API = `${BASE_API}/auth`;

export const getUserAccess = async (): Promise<UserAccess> => {
    const { data } = await axiosClient.get(`${API}/access`);
    return data;
};