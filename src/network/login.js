import {request} from "./request";

export function getLogin(user) {
  return request({
    url: '/login',
    params: {
      user
    }
  })
}
