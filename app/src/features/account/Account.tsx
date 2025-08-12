import { Box, Button, Card, Grid, Group, Space, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconKey, IconLogout, IconTrash, IconUserCircle } from "@tabler/icons-react";
import { useEffect } from "react";

import ClearBrowser from "@src/components/ClearBrowser";
import PageTop from "@src/components/PageTop";
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
    setCenterContent();
  }, []);

  if (!accessToken) {
    return <Login />;
  }

  return (
    <Box m="md">
      {/* Header */}
      <PageTop title="Account" description="Manage your profile, sign-ins, and device data" titleMb="xs" />

      {/* Content */}
      <Grid>
        {/* Profile */}
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
          <Card withBorder radius="md" padding="lg" shadow="sm">
            <Group mb="md" align="flex-start">
              <ThemeIcon size={40} radius="md" color="primary">
                <IconUserCircle size={24} />
              </ThemeIcon>
              <Title order={4}>Profile</Title>
            </Group>

            <Group>
              <Text fw={700}>User</Text>
              <Text>#{userId}</Text>
            </Group>

            <Space h="md" />
            <Button fullWidth variant="outline" color="orange" leftSection={<IconLogout size={16} />} onClick={logout}>
              Logout
            </Button>
          </Card>
        </Grid.Col>

        {/* Authentication */}
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
          <Card withBorder radius="md" padding="lg" shadow="sm">
            <Group mb="md" align="flex-start">
              <ThemeIcon size={40} radius="md" color="primary">
                <IconKey size={24} />
              </ThemeIcon>
              <Title order={4}>Authentication</Title>
            </Group>

            {auths && auths.length > 0 ? (
              <Stack gap="xs">
                {auths.map((a) => (
                  <Group key={a.type} gap="sm">
                    <Text fw={700}>{a.type}</Text>
                    <Text>{a.identity}</Text>
                  </Group>
                ))}
              </Stack>
            ) : (
              <Stack gap={4}>
                <Text fw={700}>Anonymous</Text>
                <Text size="sm" c="dimmed">
                  Sign in later to sync your library across devices.
                </Text>
              </Stack>
            )}
          </Card>
        </Grid.Col>

        {/* Device / Misc */}
        <Grid.Col span={{ base: 12, md: 12, lg: 4 }}>
          <Card withBorder radius="md" padding="lg" shadow="sm">
            <Group mb="md" align="flex-start">
              <ThemeIcon size={40} radius="md" color="primary">
                <IconTrash size={24} />
              </ThemeIcon>
              <Title order={4}>Device</Title>
            </Group>

            <Text size="sm" c="dimmed" mb="sm">
              Clear cached app data on this device.
            </Text>
            <ClearBrowser />
          </Card>
        </Grid.Col>
      </Grid>

      <Space h="xl" />
    </Box>
  );
}

export default Account;
