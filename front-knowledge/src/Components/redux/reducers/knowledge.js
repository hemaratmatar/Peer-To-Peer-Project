import { ADD_KNOWLEDGE, ADD_ERROR, SHOWALL_KNOW, SHOW_KNOW, KNOW_ERROR, EDIT_KNOW, DELETE_KNOWLEDGE } from "../action/types";

const initialState = {
  knowledge: null,
  know: null,
  loading: true,
  error: {}
};

export default function(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case SHOWALL_KNOW:
      return {
        ...state,
        knowledge: payload,
        loading: false
      };
    case ADD_KNOWLEDGE:
    case SHOW_KNOW:
    case EDIT_KNOW:
      return {
        ...state,
        know: payload,
        loading: false
      };
    case DELETE_KNOWLEDGE:
      return {
        ...state,
        knowledge: (state.knowledge || []).filter(course => course._id !== payload),
        loading: false
      };
    case KNOW_ERROR:
      return {
        ...state,
        error: payload,
        know: null,
        loading: false
      };
    case ADD_ERROR:
      // Keep already-loaded courses so a failed action does not blank the page
      return {
        ...state,
        error: payload,
        loading: false
      };
    default:
      return state;
  }
}
