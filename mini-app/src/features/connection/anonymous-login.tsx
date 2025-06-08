import { InternalAppLoginResponse } from "@src/generated/api";
import { Signals } from "@src/signals-registry";
import { useContext, useEffect } from "react";
import { AuthApiContext } from "./api-connection";

function AnonymousLogin() {
  const authApi = useContext(AuthApiContext);

  function handleTokens(response: InternalAppLoginResponse) {
    if (response.access_token) {
      // Store in local storage
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("refresh_token", response.refresh_token || "");

      // Get sub from access token
      const sub = response.access_token.split(".")[1];
      if (sub) {
        const decodedSub = JSON.parse(atob(sub));
        const userId = parseInt(decodedSub.sub, 10);
        Signals.userId.set(userId || null);
        console.log("User ID set from access token:", userId);
      }

      Signals.accessToken.set(response.access_token);
    }
  }

  useEffect(() => {
    if (!authApi) {
      console.error("Auth API is not available");
      return;
    }

    Signals.accessToken.set(null);

    const refreshToken = localStorage.getItem("refresh_token");

    new Promise<void>(async (resolve) => {
      if (refreshToken) {
        try {
          await authApi
            .apiAuthRefreshTokenPost({ data: { refresh_token: refreshToken } })
            .then(handleTokens)
            .then(() => {
              console.log("Refreshed access token successfully");
            });
          return;
        } catch (err) {
          console.error("Failed to refresh access token:", err);
          console.log("Will log in anonymously");
        }
      }

      await authApi
        .apiAuthAnonymousPost()
        .then(handleTokens)
        .then(() => {
          console.log("Logged in anonymously successfully");
        })
        .catch(console.error);
      resolve();
    });
  }, [authApi]);

  return <></>;
}

export default AnonymousLogin;
