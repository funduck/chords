import { Box, Button, Flex, Group, Space, Stack, Text, Title } from "@mantine/core";
import { useEffect } from "react";

import ClearBrowser from "@src/components/ClearBrowser";
import { useAccountContext } from "@src/features/account/AccountContext";
import { useUserApi } from "@src/hooks/Api";
import { useHeader } from "@src/hooks/Header";

import Login from "./Login";

function Account() {
  const userApi = useUserApi();
  const { accessToken, userId, auths, getAuths, logout } = useAccountContext();

  useEffect(() => {
    if (accessToken && userApi) {
      getAuths();
    }
  }, [accessToken, userApi]);

  const { setCenterContent } = useHeader();
  useEffect(() => {
    setCenterContent("Account");
  }, []);

  if (!accessToken) {
    return <Login />;
  }

  return (
    <Flex direction={"column"} gap={"md"}>
      <Title order={3}>Account</Title>
      <Group>
        <Text fw={700}>User</Text>
        <Text>#{userId}</Text>
      </Group>
      <Box>
        <Button onClick={logout} color="orange" variant="outline">
          Logout
        </Button>
      </Box>
      <Space h="md" />

      <Title order={3}>Auth</Title>
      {auths && auths.length > 0 && (
        <Stack>
          {auths.map((a) => (
            <Group key={a.type}>
              <Text fw={700}>{a.type}</Text>
              <Text>{a.identity}</Text>
            </Group>
          ))}
        </Stack>
      )}
      {!auths?.length && (
        <Group>
          <Text fw={700}>Anonymous</Text>
        </Group>
      )}
      <Space h="md" />

      <Title order={3}>Misc</Title>
      <Box>
        <ClearBrowser />
      </Box>
      <Space h="md" />
    </Flex>
  );
}

export default Account;
