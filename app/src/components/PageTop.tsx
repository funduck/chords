import { Stack, Text, Title } from "@mantine/core";
import React from "react";

interface PageTopProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  order?: 1 | 2 | 3 | 4 | 5 | 6;
  titleMb?: number | string;
  children?: React.ReactNode;
}

/**
 * A reusable page header component with centered title and description
 */
export default function PageTop({ title, description, order = 2, titleMb = 0, children }: PageTopProps) {
  return (
    <Stack ta="start" ml="md" mb="md">
      <Title order={order} c="primary" mb={titleMb}>
        {title}
      </Title>
      {description &&
        (typeof description === "string" ? (
          <Text size="sm" c="dimmed">
            {description}
          </Text>
        ) : (
          description
        ))}
      {children}
    </Stack>
  );
}
