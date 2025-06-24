import { Box, Slider as MantineSlider } from "@mantine/core";

import Text from "@components/Text";

type SliderProps = {
  disabled?: boolean;
  label?: string;
  onChange: (value: number) => void;
  value?: number;
};

function Slider({ disabled, label, onChange, value }: SliderProps) {
  return (
    <Box>
      {label && <Text>{label}</Text>}
      <MantineSlider
        size="md"
        disabled={disabled}
        value={value ?? 0} // Ensure value is controlled and defaults to 0
        onChange={(val) => onChange(val)} // Pass the value directly to the onChange handler
      ></MantineSlider>
    </Box>
  );
}

export default Slider;
