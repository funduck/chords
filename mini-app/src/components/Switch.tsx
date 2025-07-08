import { Box, Switch as MantineSwitch, Text } from "@mantine/core";

type SwitchProps = {
  label?: string;
  disabled?: boolean;
  checked?: boolean;
  onChange: (value: boolean) => void;
};

function Switch({ label, disabled, checked, onChange }: SwitchProps) {
  return (
    <Box m={"sm"}>
      {/* {label && <Text>{label}</Text>} */}
      <MantineSwitch
        label={label}
        size="md"
        disabled={disabled}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      ></MantineSwitch>
    </Box>
  );
}

export default Switch;
