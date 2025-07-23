import { Box, Button, Flex, Stack, Text } from "@mantine/core";
import { useEffect } from "react";

import { useAccountContext } from "@src/features/account/AccountContext";

import Login from "./Login";

function Account() {
  const { accessToken, userId, auths, getAuths, logout } = useAccountContext();

  useEffect(() => {
    if (accessToken) {
      getAuths();
    }
  }, [accessToken, getAuths]);

  if (!accessToken) {
    return <Login />;
  }

  return (
    <Flex direction={"column"} gap={"md"}>
      <Text>Logged in as user #{userId}</Text>
      {auths?.length && (
        <Stack>
          {auths.map((a) => (
            <Text>
              {a.type}: {a.identity}
            </Text>
          ))}
        </Stack>
      )}
      <Box>
        <Button onClick={logout} color="orange" variant="outline">
          Logout
        </Button>
      </Box>
    </Flex>
  );
}

export default Account;
