import {
	GET_ALLUSER,CLEAR_USER,USER_ERROR,USER_CREATED,USER_DELETED,USER_UPDATED
} from '../action/types';

const initialState = {
	user: null,
	users: [],
	credentials: null,
	loading: true,
	error: {}
};

export default function(state = initialState, action) {
	const { type, payload } = action;

	switch (type) {
		case GET_ALLUSER:
			return {
				...state,
				users: payload,
				loading: false
			};
		case USER_CREATED:
			return {
				...state,
				users: [...state.users, payload.user],
				credentials: payload.credentials,
				loading: false
			};
		case USER_DELETED:
			return {
				...state,
				users: state.users.filter(user => user._id !== payload && user.id !== payload),
				loading: false
			};
		case USER_UPDATED:
			return {
				...state,
				users: state.users.map(user => (user._id || user.id) === (payload._id || payload.id) ? payload : user),
				credentials: null,
				loading: false
			};
		case USER_ERROR:
			return {
				...state,
				error: payload,
				loading: false,
				user:null
			};
		case CLEAR_USER:
			return{
				...state,
				user:null,
				credentials:null,
				loading: false
			};
		default:
			return state;
	}
}
