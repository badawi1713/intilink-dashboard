import { InitialMasterUsersState, MasterUsersAction } from '../../../action-types/masters-type/users-type/users.type';
import * as REDUCER_TYPES from '../../../types';

const initialState: InitialMasterUsersState = {
  data: [],
  memberData: [],
  userVerificationData: null,
  zonapayId: '',
  limit: 5,
  page: 0,
  total: 0,
  sortBy: 'id',
  sortType: 'asc',
  search: '',
  loadingList: true,
  loadingPost: false,
  loadingDelete: false,
  loadingDetail: false,
  loading: true,
  error: null,
};

const masterUsersReducer = (state = initialState, action: MasterUsersAction) => {
  switch (action.type) {
    case REDUCER_TYPES.SET_MASTER_USERS_REDUCER:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export default masterUsersReducer;
