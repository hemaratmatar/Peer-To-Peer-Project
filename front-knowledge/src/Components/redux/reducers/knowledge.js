import { ADD_KNOWLEDGE, ADD_ERROR, SHOWALL_KNOW,SHOW_KNOW,EDIT_KNOW,DELETE_KNOWLEDGE } from "../action/types";

const initialState = {
  knowledge: null,
  know:null,
  knowledges: [],
  repos: [],
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
      return {
        ...state,
        know:payload,
        loading:false
      }
    case EDIT_KNOW:
      return {
        ...state,
        know:payload,
        loading: false
      }
    case DELETE_KNOWLEDGE:
      return {
        ...state,
        knowledge: (state.knowledge || []).filter(course => course._id !== payload),
        loading: false
      }
      case ADD_ERROR:
      return {
        ...state,
        error: payload,
        loading: false,
        knowledge: null,
        know:null
      };
    default:
      return state;
  }
}
