import { Box, Button, Flex, Text } from "@mantine/core";
import { useSignal } from "@telegram-apps/sdk-react";

import { useAccountContext } from "@src/features/account/AccountContext";
import { Signals } from "@src/services/signals-registry";

import Login from "./Login";

function Account() {
  const { logout } = useAccountContext();
  const accessToken = useSignal(Signals.accessToken);
  const userId = useSignal(Signals.userId);

  if (!accessToken) {
    return <Login />;
  }

  return (
    <Flex direction={"column"} gap={"md"}>
      <Text>Logged in as user #{userId}</Text>
      <Box>
        <Button onClick={logout} color="orange" variant="outline">
          Logout
        </Button>
      </Box>
    </Flex>
  );
}

export default Account;
