import { MantineSpacing, Stack as MantineStack } from "@mantine/core";

type StackProps = {
  gap?: MantineSpacing;
  children: React.ReactNode;
};

function Stack({ gap, children }: StackProps) {
  return <MantineStack gap={gap ?? "md"}>{children}</MantineStack>;
}

export default Stack;
