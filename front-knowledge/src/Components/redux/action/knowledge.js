import axios from "axios";
import {
  ADD_KNOWLEDGE,
  ADD_ERROR,
  SHOWALL_KNOW,
  SHOW_KNOW,
  KNOW_ERROR,
  EDIT_KNOW,
  DELETE_KNOWLEDGE
} from "./types";
import errorPayload from "../utils/errorPayload";

const jsonConfig = { headers: { "Content-Type": "application/json" } };

// Records the error in the store and rethrows so the caller can show it
const failed = (dispatch, err) => {
  dispatch({ type: ADD_ERROR, payload: errorPayload(err) });
  throw err;
};

export const addKnowledge = (formKnow, history) => async dispatch => {
  try {
    const res = await axios.post("/api/know", formKnow, jsonConfig);
    dispatch({ type: ADD_KNOWLEDGE, payload: res.data });
    history.push("/home");
  } catch (err) {
    failed(dispatch, err);
  }
};

export const getKnowledge = () => async dispatch => {
  try {
    const res = await axios.get("/api/know");
    dispatch({ type: SHOWALL_KNOW, payload: res.data });
  } catch (err) {
    dispatch({ type: ADD_ERROR, payload: errorPayload(err) });
  }
};

export const getKnowbyID = id => async dispatch => {
  try {
    const res = await axios.get(`/api/know/${id}`);
    dispatch({ type: SHOW_KNOW, payload: res.data });
  } catch (err) {
    dispatch({ type: KNOW_ERROR, payload: { ...errorPayload(err), id } });
  }
};

export const editKnowledge = (formKnows, history) => async dispatch => {
  try {
    const res = await axios.post("/api/know/editknow", formKnows, jsonConfig);
    dispatch({ type: EDIT_KNOW, payload: res.data });
    history.push("/home");
  } catch (err) {
    failed(dispatch, err);
  }
};

export const deleteKnowledge = id => async dispatch => {
  try {
    await axios.delete(`/api/know/${id}`);
    dispatch({ type: DELETE_KNOWLEDGE, payload: id });
  } catch (err) {
    failed(dispatch, err);
  }
};

const lessonRequest = async (request, dispatch) => {
  try {
    const res = await request;
    dispatch({ type: SHOW_KNOW, payload: res.data });
    return res.data;
  } catch (err) {
    return failed(dispatch, err);
  }
};

export const addLesson = (courseId, formData) => dispatch => lessonRequest(
  axios.post(`/api/know/${courseId}/lessons`, formData),
  dispatch
);

export const updateLesson = (courseId, lessonId, formData) => dispatch => lessonRequest(
  axios.put(`/api/know/${courseId}/lessons/${lessonId}`, formData),
  dispatch
);

export const deleteLesson = (courseId, lessonId) => dispatch => lessonRequest(
  axios.delete(`/api/know/${courseId}/lessons/${lessonId}`),
  dispatch
);
