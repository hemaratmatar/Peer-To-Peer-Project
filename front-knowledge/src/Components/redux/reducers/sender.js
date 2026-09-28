import { GETALL_SENDER, GETSENDER_ERROR } from "../action/types";

const initialState = {
  sender: null,
  loading: true,
  error: {}
};

export default function(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GETALL_SENDER:
      return {
        ...state,
        sender: payload,
        loading: false
      };
    case GETSENDER_ERROR:
      return {
        ...state,
        error: payload,
        loading: false,
        sender: null
      };
    default:
      return state;
  }
}
