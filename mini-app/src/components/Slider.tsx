import { Box, Slider as MantineSlider } from "@mantine/core";

import Text from "@components/Text";

type SliderProps = {
  disabled?: boolean;
  label?: string;
  min?: number;
  onChange: (value: number) => void;
  value?: number;
};

function Slider({ disabled, label, min = 0, onChange, value }: SliderProps) {
  return (
    <Box>
      {label && <Text>{label}</Text>}
      <MantineSlider
        size="md"
        disabled={disabled}
        min={min}
        value={value || min} // Ensure value is controlled and defaults to 0
        onChange={(val) => {
          onChange(val);
        }}
      ></MantineSlider>
    </Box>
  );
}

export default Slider;
