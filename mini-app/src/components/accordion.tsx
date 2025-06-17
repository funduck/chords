import { Accordion as TelegramAccordion } from "@telegram-apps/telegram-ui";

type AccordionProps = {
  onChange: (expanded: boolean) => void;
  expanded: boolean;
  children: React.ReactNode;
};

function Accordion({ onChange, expanded, children }: AccordionProps) {
  return (
    <TelegramAccordion onChange={onChange} expanded={expanded}>
      {children}
    </TelegramAccordion>
  );
}

Accordion.Summary = TelegramAccordion.Summary;
Accordion.Content = TelegramAccordion.Content;

export default Accordion;
