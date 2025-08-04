import { Button, Fieldset, Flex, Group, Modal, Space, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useSignal } from "@telegram-apps/sdk-react";

import { Signals } from "@src/services/signals-registry";

import About, { TitleAbout } from "../about/About";
import { useAccountContext } from "./AccountContext";

function Login() {
  const { loginAnonymous, loginByEmail } = useAccountContext();
  const accessToken = useSignal(Signals.accessToken);

  const loginByEmailForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
    },

    validate: {
      email: (value: string) => (/^\S+@\S+\.\S+$/.test(value) ? null : "Invalid email"),
    },
  });

  if (accessToken) {
    return <></>;
  }

  return (
    <Modal opened={true} onClose={() => {}} withCloseButton={false}>
      <Flex direction="column" ta="center">
        <TitleAbout />
      </Flex>
      <Space h="md" />

      <Fieldset legend="Anonymous">
        <Group justify="flex-end">
          <Text>You will have full functionality, but only in this browser</Text>
          <Button onClick={loginAnonymous}>Login anonymously</Button>
        </Group>
      </Fieldset>

      <Space h="md" />

      <Fieldset legend="Email">
        <form onSubmit={loginByEmailForm.onSubmit((values) => loginByEmail(values.email))}>
          <TextInput
            withAsterisk
            label=""
            placeholder="your@email.com"
            key={loginByEmailForm.key("email")}
            {...loginByEmailForm.getInputProps("email")}
          />

          <Group justify="flex-end" mt="md">
            <Button type="submit">Login by email</Button>
          </Group>
        </form>
      </Fieldset>
    </Modal>
  );
}

export default Login;
