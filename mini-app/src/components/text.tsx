import { Text as TelegramText } from "@telegram-apps/telegram-ui";

type TextProps = {
  children: React.ReactNode;
};

function Text({ children }: TextProps) {
  return <TelegramText>{children}</TelegramText>;
}

export default Text;
