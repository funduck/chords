import { Box, Slider as MantineSlider, Text } from "@mantine/core";

type SliderProps = {
  disabled?: boolean;
  label?: string;
  onChange: (value: number) => void;
};

function Slider({ disabled, label, onChange }: SliderProps) {
  return (
    <Box>
      {label && <Text>{label}</Text>}
      <MantineSlider size="md" disabled={disabled} label={label} onChange={onChange}></MantineSlider>
    </Box>
  );
}

export default Slider;
