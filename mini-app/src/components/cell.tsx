import { Cell as TelegramCell } from "@telegram-apps/telegram-ui";

type CellProps = {
  after?: React.ReactNode;
  children: React.ReactNode;
};

function Cell({ after, children }: CellProps) {
  return <TelegramCell after={after}>{children}</TelegramCell>;
}

export default Cell;
