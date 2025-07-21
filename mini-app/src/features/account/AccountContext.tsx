import { Anchor, Box } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ReactNode, createContext, useContext, useEffect } from "react";
import { useNavigate } from "react-router";

import { RoutesEnum } from "@src/Router";
import { InternalAppLoginResponse } from "@src/generated/api";
import { AuthApiContext } from "@src/hooks/Api";
import { Signals } from "@src/services/signals-registry";

interface AccountContextType {
  confirmAuth: (code: string) => Promise<void>;
  loginAnonymous: () => Promise<void>;
  loginByEmail: (email: string) => Promise<void>;
  logout: () => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const authApi = useContext(AuthApiContext);
  const navigate = useNavigate();

  function handleTokens(response: InternalAppLoginResponse) {
    if (response.access_token) {
      // Store in local storage
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("refresh_token", response.refresh_token || "");
      localStorage.setItem("user_id", response.user_id?.toString() || "");

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
      })
      .catch((error) => {
        console.error("Anonymous login failed:", error);
        notifications.show({
          title: "Login Failed",
          message: "Failed to log in anonymously",
          color: "red",
          position: "top-right",
        });
        throw error;
      });
  };

  const loginByEmail = async (email: string): Promise<void> => {
    assertApiIsAvailable();

    return authApi!
      .emailAuth({ data: { email } })
      .then((res) => {
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
                Email confirmation is not implemented yet, so{" "}
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
      })
      .catch((error) => {
        console.error("Email login failed:", error);
        notifications.show({
          title: "Login Failed",
          message: "Failed to log in by email",
          color: "red",
          position: "top-right",
        });
        throw error;
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
      })
      .catch((error) => {
        console.error("Account confirmation failed:", error);
        notifications.show({
          title: "Confirmation Failed",
          message: "Failed to confirm account",
          color: "red",
          position: "top-right",
        });
        throw error;
      });
  };

  const logout = (): void => {
    // Clear tokens from localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    // Clear signals
    Signals.accessToken.set(null);
    Signals.userId.set(null);

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
        confirmAuth,
        loginAnonymous,
        loginByEmail,
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
