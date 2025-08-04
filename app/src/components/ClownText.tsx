import { Group, Text } from "@mantine/core";

function getColorForChar(char: string): string {
  const colors = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];
  const index = char.toLowerCase().charCodeAt(0) % colors.length;
  return colors[index];
}

export function ClownText({ text }: { text: string }) {
  return (
    <Group gap={0}>
      {text.split("").map((char, index) => (
        <Text key={index} size="xl" c={getColorForChar(char)} style={{ whiteSpace: "pre" }}>
          {char}
        </Text>
      ))}
    </Group>
  );
}
