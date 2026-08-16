import { Anchor, Box } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { ChordsComApiInternalDtoSharedCollection, InternalAppLoginResponse } from "@generated/api";

import { RoutesEnum } from "@src/Router";
import { AuthEntity, useAuthApi, useSharesApi, useUserApi } from "@src/hooks/Api";
import { Signals } from "@src/services/signals-registry";

export type SharedCollection = ChordsComApiInternalDtoSharedCollection;

interface AccountContextType {
  accessToken?: string | null;
  auths?: AuthEntity[] | null;
  userId?: number | null;
  collections?: SharedCollection[] | null;
  loginAnonymous: () => Promise<void>;
  loginByEmail: (email: string) => Promise<void>;
  confirmAuth: (code: string) => Promise<void>;
  getAuths: () => Promise<void>;
  getCollections: () => Promise<void>;
  redeemPendingShare: () => Promise<void>;
  logout: () => void;
}

// A share code the user opened before authenticating. Persisted so it survives
// the login/registration flow and is redeemed once the account is active.
export const PENDING_SHARE_CODE_KEY = "pending_share_code";

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const authApi = useAuthApi();
  const userApi = useUserApi();
  const sharesApi = useSharesApi();

  const navigate = useNavigate();

  const [userId, setUserId] = useState<number | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [auths, setAuths] = useState<AuthEntity[] | null>(null);
  const [collections, setCollections] = useState<SharedCollection[] | null>(null);

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
        // notifications.show({
        //   title: "Logged In",
        //   message: "You have been logged in anonymously",
        //   color: "green",
        //   position: "top-right",
        // });
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
      if (res.link && res.code) {
        notifications.show({
          title: "Email Confirmation",
          message: (
            <Box>
              Lets pretend that we sent you an email to {email} with a link to confirm your account. So, if you want to
              continue,{" "}
              <Anchor
                onClick={(e) => {
                  e.preventDefault();
                  navigate(RoutesEnum.Confirm(res.code!));
                  notifications.clean();
                }}
                href={res.link}
                target="_blank"
                rel="noopener noreferrer"
              >
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
        // notifications.show({
        //   title: "Account Confirmed",
        //   message: "Your account has been confirmed successfully",
        //   color: "green",
        //   position: "top-right",
        // });
        navigate(RoutesEnum.Account);
      });
  };

  const getAuths = async () => {
    assertApiIsAvailable();

    return userApi?.getAuths().then((response) => {
      setAuths(response);
    });
  };

  const getCollections = async () => {
    return sharesApi?.listSharedCollections().then((response) => {
      setCollections(response);
    });
  };

  // Load shared collections once the user is authenticated so the search
  // filters can offer them.
  useEffect(() => {
    if (accessToken && sharesApi) {
      getCollections();
    }
  }, [accessToken, sharesApi]);

  // Redeem a share code the user opened while unauthenticated. This runs both
  // when opening a /share link (already logged in) and after registration
  // completes and the token/API become available.
  const redeemPendingShare = async () => {
    const code = localStorage.getItem(PENDING_SHARE_CODE_KEY);
    if (!code || !accessToken || !sharesApi) {
      return;
    }
    try {
      const res = await sharesApi.redeemShare({ code });
      localStorage.removeItem(PENDING_SHARE_CODE_KEY);
      await getCollections();
      notifications.show({
        title: "Collection added",
        message: `You can now browse ${res.label}'s collection from the library filter.`,
        color: "green",
        position: "top-right",
      });
    } catch (err) {
      console.error("Failed to redeem pending share link:", err);
      localStorage.removeItem(PENDING_SHARE_CODE_KEY);
      notifications.show({
        title: "Invalid link",
        message: "The share link is invalid or has been revoked.",
        color: "red",
        position: "top-right",
      });
    }
  };

  useEffect(() => {
    redeemPendingShare();
  }, [accessToken, sharesApi]);

  const logout = (): void => {
    // Clear tokens from localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    // Clear signals
    Signals.accessToken.set(null);
    Signals.userId.set(null);

    setUserId(null);
    setAccessToken(null);
    setCollections(null);

    console.log("Logged out successfully");

    // notifications.show({
    //   title: "Logged Out",
    //   message: "You have been logged out successfully",
    //   color: "blue",
    //   position: "top-right",
    // });
  };

  return (
    <AccountContext.Provider
      value={{
        accessToken,
        auths,
        userId,
        collections,
        loginAnonymous,
        loginByEmail,
        confirmAuth,
        getAuths,
        getCollections,
        redeemPendingShare,
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
