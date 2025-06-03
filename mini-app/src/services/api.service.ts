import { ApiHttpUrl } from "@src/config";
import { AuthApi, Configuration, RoomsApi } from "@src/generated/api";

export let authAPI: AuthApi;
export let roomAPI: RoomsApi;

export function initApi() {
  const conf = new Configuration({
    basePath: ApiHttpUrl,
  });
  authAPI = new AuthApi(conf);
  roomAPI = new RoomsApi(conf);
}

export function setAccessToken(token: string) {
  const conf = new Configuration({
    basePath: ApiHttpUrl,
    accessToken: token,
    // TODO middleware to refresh access token
  });
  roomAPI = new RoomsApi(conf);
}
