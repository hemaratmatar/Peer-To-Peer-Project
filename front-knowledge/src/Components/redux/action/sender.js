import axios from "axios";
import { GETALL_SENDER, GETSENDER_ERROR } from "./types";
import errorPayload from "../utils/errorPayload";

export const getSender = () => async dispatch => {
  try {
    const res = await axios.get("/api/sender");
    dispatch({
      type: GETALL_SENDER,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: GETSENDER_ERROR,
      payload: errorPayload(err)
    });
  }
};
