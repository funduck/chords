import { Box } from "@mantine/core";
import { useEffect } from "react";
import { useParams } from "react-router";

import { useAuthApi } from "@src/hooks/Api";

import { useAccountContext } from "./AccountContext";

function Confirm() {
  const authApi = useAuthApi();
  const { confirmAuth } = useAccountContext();
  const params = useParams<{ code: string }>();
  const code = params.code;

  useEffect(() => {
    if (code && confirmAuth && authApi) {
      confirmAuth(code);
    }
  }, [code, confirmAuth, authApi]);

  return <Box>Confirming your account...</Box>;
}

export default Confirm;
