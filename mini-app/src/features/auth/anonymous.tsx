import { InternalAppLoginResponse } from "@src/generated/api";
import { authAPI, setAccessToken } from "@src/services/api.service";
import { Signals } from "@src/signals-registry";
import { useEffect } from "react";

function AnonymousAuth() {
  function handleTokens(response: InternalAppLoginResponse) {
    if (response.access_token) {
      // Store in local storage
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("refresh_token", response.refresh_token || "");

      // Set the access token in the API service
      setAccessToken(response.access_token);

      Signals.accessToken.set(response.access_token);
    }
  }

  useEffect(() => {
    Signals.accessToken.set(null);

    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      authAPI
        .apiAuthRefreshTokenPost({ data: { refresh_token: refreshToken } })
        .then(handleTokens)
        .then(() => {
          console.log("Refreshed access token successfully");
        })
        .catch(console.error);
      return;
    }

    authAPI
      .apiAuthAnonymousPost()
      .then(handleTokens)
      .then(() => {
        console.log("Logged in anonymously successfully");
      })
      .catch(console.error);
  }, []);

  return <></>;
}

export default AnonymousAuth;
