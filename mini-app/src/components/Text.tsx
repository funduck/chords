import { Text as MantineText } from "@mantine/core";

type TextProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
};

function Text({ children, style }: TextProps) {
  return (
    <MantineText size="md" style={style}>
      {children}
    </MantineText>
  );
}

export default Text;
