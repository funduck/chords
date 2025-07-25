import { Anchor } from "@mantine/core";

type ButtonCellProps = {
  onClick: () => void;
  children: React.ReactNode;
};

function ButtonCell({ onClick, children }: ButtonCellProps) {
  return <Anchor onClick={onClick}>{children}</Anchor>;
}

export default ButtonCell;
