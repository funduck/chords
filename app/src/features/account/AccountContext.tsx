import { Anchor, Box } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { InternalAppLoginResponse } from "@generated/api";

import { RoutesEnum } from "@src/Router";
import { AuthEntity, useAuthApi, useUserApi } from "@src/hooks/Api";
import { Signals } from "@src/services/signals-registry";

interface AccountContextType {
  accessToken?: string | null;
  auths?: AuthEntity[] | null;
  userId?: number | null;
  loginAnonymous: () => Promise<void>;
  loginByEmail: (email: string) => Promise<void>;
  confirmAuth: (code: string) => Promise<void>;
  getAuths: () => Promise<void>;
  logout: () => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const authApi = useAuthApi();
  const userApi = useUserApi();

  const navigate = useNavigate();

  const [userId, setUserId] = useState<number | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [auths, setAuths] = useState<AuthEntity[] | null>(null);

  function handleTokens(response: InternalAppLoginResponse) {
    if (response.access_token) {
      // Store in local storage
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("refresh_token", response.refresh_token || "");
      localStorage.setItem("user_id", response.user_id?.toString() || "");

      setUserId(response.user_id || null);
      setAccessToken(response.access_token);

      Signals.userId.set(response.user_id || null);
      Signals.accessToken.set(response.access_token);
    }
  }

  function assertApiIsAvailable() {
    if (!authApi) {
      notifications.show({
        title: "Error",
        message: "Auth API is not available",
        color: "red",
        position: "top-right",
      });
      throw new Error("Auth API is not available");
    }
  }

  function refreshAccessToken() {
    assertApiIsAvailable();

    Signals.accessToken.set(null);

    const refreshToken = localStorage.getItem("refresh_token");

    if (refreshToken) {
      authApi!
        .refreshToken({ data: { refresh_token: refreshToken } })
        .then(handleTokens)
        .then(() => {
          console.log("Refreshed access token successfully");
        })
        .catch((err) => {
          console.error("Failed to refresh access token:", err);
        });
      return;
    }
  }

  useEffect(() => {
    if (!authApi) {
      return;
    }
    refreshAccessToken();
  }, [authApi]);

  const loginAnonymous = async (): Promise<void> => {
    assertApiIsAvailable();

    return authApi!
      .anonymousLogIn()
      .then(handleTokens)
      .then(() => {
        console.log("Logged in anonymously successfully");
        notifications.show({
          title: "Logged In",
          message: "You have been logged in anonymously",
          color: "green",
          position: "top-right",
        });
      });
  };

  const loginByEmail = async (email: string): Promise<void> => {
    assertApiIsAvailable();

    return authApi!.emailAuth({ data: { email } }).then((res) => {
      // notifications.show({
      //   title: "Check your email",
      //   message: `A confirmation link has been sent to ${email}. Please check your inbox.`,
      //   color: "blue",
      //   position: "top-right",
      // });
      // TODO: remove this when email confirmation is implemented
      if (res.link) {
        notifications.show({
          title: "Email Confirmation",
          message: (
            <Box>
              Lets pretend that we sent you an email to {email} with a link to confirm your account. So, if you want to
              continue,{" "}
              <Anchor href={res.link} target="_blank" rel="noopener noreferrer">
                click here
              </Anchor>
            </Box>
          ),
          color: "green",
          position: "top-right",
          autoClose: false,
        });
      }
    });
  };

  const confirmAuth = async (code: string): Promise<void> => {
    assertApiIsAvailable();

    return authApi!
      .confirmAuth({ code })
      .then(handleTokens)
      .then(() => {
        console.log("Account confirmed successfully");
        notifications.show({
          title: "Account Confirmed",
          message: "Your account has been confirmed successfully",
          color: "green",
          position: "top-right",
        });
        navigate(RoutesEnum.Account);
      });
  };

  const getAuths = async () => {
    assertApiIsAvailable();

    return userApi?.getAuths().then((response) => {
      setAuths(response);
    });
  };

  const logout = (): void => {
    // Clear tokens from localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    // Clear signals
    Signals.accessToken.set(null);
    Signals.userId.set(null);

    setUserId(null);
    setAccessToken(null);

    console.log("Logged out successfully");

    notifications.show({
      title: "Logged Out",
      message: "You have been logged out successfully",
      color: "blue",
      position: "top-right",
    });
  };

  return (
    <AccountContext.Provider
      value={{
        accessToken,
        auths,
        userId,
        loginAnonymous,
        loginByEmail,
        confirmAuth,
        getAuths,
        logout,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccountContext() {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccountContext must be used within AccountProvider");
  }
  return context;
}
