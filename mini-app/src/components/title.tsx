import { Title as TelegramTitle } from "@telegram-apps/telegram-ui";

type TitleProps = {
  children: React.ReactNode;
};

function Title({ children }: TitleProps) {
  return <TelegramTitle>{children}</TelegramTitle>;
}

export default Title;
