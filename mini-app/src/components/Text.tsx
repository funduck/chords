import { Text as MantineText } from "@mantine/core";

type TextProps = {
  children: React.ReactNode;
};

function Text({ children }: TextProps) {
  return <MantineText size="md">{children}</MantineText>;
}

export default Text;
