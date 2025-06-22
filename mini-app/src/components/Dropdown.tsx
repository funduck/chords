import { Button, Menu } from "@mantine/core";

type DropdownProps = {
  onChange?: (expanded: boolean) => void;
  expanded?: boolean;
  title: React.ReactNode;
  children: React.ReactNode;
};

function Dropdown({ onChange, expanded, title, children }: DropdownProps) {
  return (
    <Menu shadow="md" opened={expanded} onChange={onChange} closeOnItemClick={false} closeOnClickOutside={false}>
      <Menu.Target>
        <Button variant="outline" color="gray">
          {title}
        </Button>
      </Menu.Target>
      <Menu.Dropdown p="lg">{children}</Menu.Dropdown>
    </Menu>
  );
}

Dropdown.Item = function DropdownItem({ children }: { children: React.ReactNode }) {
  return <Menu.Item>{children}</Menu.Item>;
};

export default Dropdown;
