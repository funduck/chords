import { Box, Loader, Stack, Text } from "@mantine/core";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";

import { RoutesEnum } from "@src/Router";
import { PENDING_SHARE_CODE_KEY, useAccountContext } from "@src/features/account/AccountContext";

function RedeemShare() {
  const { redeemPendingShare } = useAccountContext();
  const navigate = useNavigate();
  const params = useParams<{ code: string }>();
  const code = params.code;

  useEffect(() => {
    if (!code) {
      return;
    }
    // Persist the code so it survives the login/registration flow, then try to
    // redeem right away (works if already authenticated). If not yet logged in,
    // AccountContext redeems it once the account becomes active.
    localStorage.setItem(PENDING_SHARE_CODE_KEY, code);
    redeemPendingShare();
    navigate(RoutesEnum.Songs());
  }, [code]);

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
