import { Box, Loader, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { RoutesEnum } from "@src/Router";
import { useAccountContext } from "@src/features/account/AccountContext";
import { useSharesApi } from "@src/hooks/Api";

function RedeemShare() {
  const sharesApi = useSharesApi();
  const { accessToken, getCollections } = useAccountContext();
  const navigate = useNavigate();
  const params = useParams<{ code: string }>();
  const code = params.code;

  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    // Wait until authenticated so the redeem request carries a token.
    if (!code || !sharesApi || !accessToken || redeeming) {
      return;
    }
    setRedeeming(true);

    sharesApi
      .redeemShare({ code })
      .then(async (res) => {
        await getCollections();
        notifications.show({
          title: "Collection added",
          message: `You can now browse ${res.label}'s collection from the library filter.`,
          color: "green",
          position: "top-right",
        });
        navigate(RoutesEnum.Songs());
      })
      .catch((err) => {
        console.error("Failed to redeem share link:", err);
        notifications.show({
          title: "Invalid link",
          message: "This share link is invalid or has been revoked.",
          color: "red",
          position: "top-right",
        });
        navigate(RoutesEnum.Songs());
      });
  }, [code, sharesApi, accessToken, redeeming, getCollections, navigate]);

  return (
    <Box mt="xl">
      <Stack align="center" gap="md">
        <Loader />
        <Text>Adding shared collection...</Text>
      </Stack>
    </Box>
  );
}

export default RedeemShare;
