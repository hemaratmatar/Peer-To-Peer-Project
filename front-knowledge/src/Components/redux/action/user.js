import axios from 'axios';
import {
  GET_ALLUSER,
  CLEAR_USER,
  USER_ERROR,
  USER_CREATED,
  USER_DELETED,
  USER_UPDATED
} from './types';

const errorPayload = err => ({
  msg: err.response ? err.response.statusText : err.message,
  status: err.response ? err.response.status : 500
});

export const getUser = () => async dispatch => {
  dispatch({ type: CLEAR_USER });

  try {
    const res = await axios.get('/api/user');
    dispatch({ type: GET_ALLUSER, payload: res.data });
  } catch (err) {
    dispatch({ type: USER_ERROR, payload: errorPayload(err) });
  }
};

export const createUser = formData => async dispatch => {
  try {
    const res = await axios.post('/api/user', formData, {
      headers: { 'Content-Type': 'application/json' }
    });
    dispatch({ type: USER_CREATED, payload: res.data });
    return res.data;
  } catch (err) {
    dispatch({ type: USER_ERROR, payload: errorPayload(err) });
    throw err;
  }
};

export const deleteUser = id => async dispatch => {
  try {
    await axios.delete(`/api/user/${id}`);
    dispatch({ type: USER_DELETED, payload: id });
  } catch (err) {
    dispatch({ type: USER_ERROR, payload: errorPayload(err) });
  }
};

export const updateUser = (id, formData) => async dispatch => {
  try {
    const res = await axios.put(`/api/user/${id}`, formData, {
      headers: { 'Content-Type': 'application/json' }
    });
    dispatch({ type: USER_UPDATED, payload: res.data });
    return res.data;
  } catch (err) {
    dispatch({ type: USER_ERROR, payload: errorPayload(err) });
    throw err;
  }
};
