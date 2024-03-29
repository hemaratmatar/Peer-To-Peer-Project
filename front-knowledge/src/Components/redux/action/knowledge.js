import axios from "axios";
import {
  ADD_KNOWLEDGE,
  ADD_ERROR,
  SHOWALL_KNOW,
  GETALL_ERROR,
  SHOW_KNOW,
  EDIT_KNOW
} from "./types";
export const addKnowledge = (
  formKnow,
  history,
  edit = false
) => async dispatch => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json"
      }
    };
    const res = await axios.post("/api/know", formKnow, config);
    dispatch({
      type: ADD_KNOWLEDGE,
      payload: res.data
    });
    // dispatch(setAlert(edit ? 'Knowledge Updated' : 'Knowledge Add', 'success'));
    if (!edit) {
      history.push("/");
    }
  } catch (err) {
    // const errors = err.response.data.errors;
    // if (errors){
    //     errors.forEach(error => dispatch(setAlert(error.msg,'danger')));
    // }
    dispatch({
      type: ADD_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

export const getKnowledge = () => async dispatch => {
  try {
    const res = await axios.get("/api/know");

    dispatch({
      type: SHOWALL_KNOW,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: GETALL_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

export const getKnowbyID = _id => async dispatch => {
  try {
    const res = await axios.get(`/api/know/${_id}`);
    dispatch({
      type: SHOW_KNOW,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: GETALL_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

//edit knowledge on
export const editKnowledge =(formKnows,history)=> async dispatch =>{
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          'x-auth-token': localStorage.token
        }
      };
        const res = await axios.post('/api/know/editknow',formKnows,config);
      dispatch({
        type: EDIT_KNOW ,
        payload: res.data
      });
      history.push("/");
    } catch (err) {
        dispatch({
            type: ADD_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        });
    }
}