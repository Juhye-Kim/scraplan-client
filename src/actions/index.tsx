import { Dispatch } from "redux";

// Action Types
// User Action
export const SIGN_IN = "SIGN_IN" as const;
export const SIGN_OUT = "SIGN_OUT" as const;
export const USER_INFO = "USER_INFO" as const;
export const USER_EDIT_INFO = "USER_EDIT_INFO" as const;
export const WITHDRAW = "WITHDRAW" as const;
export const GET_GOOGLE_TOKEN = "GET_GOOGLE_TOKEN" as const;

// Plan Action
export const GET_PLANS = "GET_PLANS" as const;
export const GET_PLAN_CARDS = "GET_PLAN_CARDS" as const;

// Curation Action
export const GET_CURATIONS = "GET_CURATIONS" as const;
export const GET_CURATION_CARDS = "GET_CURATION_CARDS" as const;
export const GET_CURATION_REQUESTS = "GET_CURATION_REQUESTS" as const;

// Notification Action
export const NOTIFY = "NOTIFY";
export const ENQUEUE_NOTIFICATION = "ENQUEUE_NOTIFICATION" as const;
export const DEQUEUE_NOTIFICATION = "DEQUEUE_NOTIFICATION" as const;

export type Action =
  | ReturnType<typeof signIn>
  | ReturnType<typeof signOut>
  | ReturnType<typeof userInfo>
  | ReturnType<typeof userEditInfo>
  | ReturnType<typeof withdraw>
  | ReturnType<typeof getGoogleToken>
  | ReturnType<typeof getPlans>
  | ReturnType<typeof getPlanCards>
  | ReturnType<typeof getCurations>
  | ReturnType<typeof getCurationCards>
  | ReturnType<typeof getCurationsRequests>
  | ReturnType<typeof enqueueNotification>
  | ReturnType<typeof dequeueNotification>;

export interface User {
  token: string;
  email: string;
  nickname: string;
}

// Action Creators
// User Action Creator
export const signIn = (token: string, email: string, nickname: "") => {
  return {
    type: SIGN_IN,
    payload: {
      token,
      email,
    },
  };
};

export const signOut = () => {
  return {
    type: SIGN_OUT,
  };
};

export const userInfo = (token: string, email: string, nickname: string) => {
  return {
    type: USER_INFO,
    payload: {
      token,
      email,
      nickname,
    },
  };
};

export const userEditInfo = (
  token: string,
  email: string,
  nickname: string,
) => {
  return {
    type: USER_EDIT_INFO,
    payload: {
      token,
      email,
      nickname,
    },
  };
};

export const withdraw = () => {
  return {
    type: WITHDRAW,
  };
};

export const getGoogleToken = (data: string) => {
  return {
    type: GET_GOOGLE_TOKEN,
    payload: {
      data,
    },
  };
};

// Plan Action Creator
export const getPlans = (data: any) => {
  return {
    type: GET_PLANS,
    payload: {
      data,
    },
  };
};

export const getPlanCards = (data: any) => {
  return {
    type: GET_PLAN_CARDS,
    payload: {
      data,
    },
  };
};

// Curation Action Creator
export const getCurations = (data: any) => {
  return {
    type: GET_CURATIONS,
    payload: {
      data,
    },
  };
};

export const getCurationCards = (data: any) => {
  return {
    type: GET_CURATION_CARDS,
    payload: {
      data,
    },
  };
};

export const getCurationsRequests = (data: any) => {
  return {
    type: GET_CURATION_REQUESTS,
    payload: {
      data,
    },
  };
};

export const notify = (message: string, dismissTime: number = 5000) => (
  dispatch: Dispatch,
) => {
  const uuid = Math.random();
  dispatch(enqueueNotification(message, dismissTime, uuid));
  setTimeout(() => {
    dispatch(dequeueNotification());
  }, dismissTime);
};

export const enqueueNotification = (
  message: string,
  dismissTime: number,
  uuid: number,
) => {
  return {
    type: ENQUEUE_NOTIFICATION,
    payload: {
      message,
      dismissTime,
      uuid,
    },
  };
};

export const dequeueNotification = () => {
  return {
    type: DEQUEUE_NOTIFICATION,
  };
};
