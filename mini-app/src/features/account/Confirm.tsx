import { Box } from "@mantine/core";
import { useEffect } from "react";
import { useParams } from "react-router";

import { useAccountContext } from "./AccountContext";

function Confirm() {
  const { confirmAuth } = useAccountContext();
  const params = useParams<{ code: string }>();
  const code = params.code;

  useEffect(() => {
    if (code) {
      confirmAuth(code);
    }
  }, [code, confirmAuth]);

  return <Box>Confirming your account...</Box>;
}

export default Confirm;
