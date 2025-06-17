import { FixedLayout as TelegramFixedLayout } from "@telegram-apps/telegram-ui";

type FixedLayoutProps = {
  vertical: "top" | "bottom";
  children: React.ReactNode;
};

function FixedLayout({ vertical, children }: FixedLayoutProps) {
  return <TelegramFixedLayout vertical={vertical}>{children}</TelegramFixedLayout>;
}

export default FixedLayout;
