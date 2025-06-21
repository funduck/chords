import { Button as MantineButton } from "@mantine/core";
import React from "react";

type ButtonProps = {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
};

const Button: React.FC<ButtonProps> = ({ onClick, children, disabled }) => {
  return (
    <MantineButton variant="outline" onClick={onClick} disabled={disabled}>
      {children}
    </MantineButton>
  );
};

export default Button;
