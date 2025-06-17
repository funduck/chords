import { List as TelegramList } from "@telegram-apps/telegram-ui";

type ListProps = {
  children: React.ReactNode;
};

function List({ children }: ListProps) {
  return <TelegramList>{children}</TelegramList>;
}

export default List;
