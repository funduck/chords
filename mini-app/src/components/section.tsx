import { Section as TelegramSection } from "@telegram-apps/telegram-ui";

type SectionProps = {
  header?: string;
  footer?: string;
  children: React.ReactNode;
};

function Section({ header, footer, children }: SectionProps) {
  return (
    <TelegramSection header={header} footer={footer}>
      {children}
    </TelegramSection>
  );
}

export default Section;
