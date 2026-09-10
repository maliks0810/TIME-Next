import { BASE_URL } from "./endpoints";
import axiosClient from "./axios"

export type UserAccess = Record<string, string[]>;

const API = `${BASE_URL}/auth`;

export const getUserAccess = async (): Promise<UserAccess> => {
  const { data } = await axiosClient.get(`${API}/access`);
  return data;
};