import axios from "axios";
import { GETALL_RESEVER, GETALL_ERROR } from "./types";
import errorPayload from "../utils/errorPayload";

export const getResever = () => async dispatch => {
  try {
    const res = await axios.get('/api/resever');
    dispatch({
      type: GETALL_RESEVER,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: GETALL_ERROR,
      payload: errorPayload(err)
    });
  }
};
