
import axios from "axios";
import { USER_FAVOURITE_BASE } from "./endpoints";

export const getUserFavourites = (email: string) =>
  axios.post(USER_FAVOURITE_BASE + "/getUserFavourites", {
    email
  });

// eslint-disable-next-line @typescript-eslint/no-explicit-any 
export const addFavourite = (data: any) =>
  axios.post(
    USER_FAVOURITE_BASE + "/add",
    data,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );


export const removeFavourite = (reportNum: string, email: string) =>
  axios.delete(
    USER_FAVOURITE_BASE + "/remove",
    {
      params: {
        reportNum,
        email,
      },
    }
  );
