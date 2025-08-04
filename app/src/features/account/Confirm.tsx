import { Box } from "@mantine/core";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

import { useAuthApi } from "@src/hooks/Api";

import { useAccountContext } from "./AccountContext";

function Confirm() {
  const authApi = useAuthApi();
  const { confirmAuth } = useAccountContext();
  const params = useParams<{ code: string }>();
  const code = params.code;

  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (code && confirmAuth && authApi && !confirming) {
      setConfirming(true);
      confirmAuth(code);
    }
  }, [code, confirmAuth, authApi, confirming]);

  return <Box>Confirming your account...</Box>;
}

export default Confirm;
