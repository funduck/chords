import { Text } from "@mantine/core";

type TitleProps = {
  children: React.ReactNode;
};

function Title({ children }: TitleProps) {
  return <Text size="xl">{children}</Text>;
}

export default Title;
