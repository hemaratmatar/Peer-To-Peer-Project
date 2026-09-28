import { combineReducers } from "redux";
import alert from "./alert";
import auth from "./auth";
import users from './user';
import knowledge from './knowledge';
import resever from './resever'
import sender from './sender'
import { LOGOUT } from "../action/types";

const appReducer = combineReducers({
  alert,
  auth,
  users,
  knowledge,
  resever,
  sender
});

// Drop every slice on logout so the next account never sees the previous one's data
export default (state, action) => appReducer(action.type === LOGOUT ? undefined : state, action);
