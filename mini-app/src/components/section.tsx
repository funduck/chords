type SectionProps = {
  header?: string;
  footer?: string;
  children: React.ReactNode;
};

function Section({ header, footer, children }: SectionProps) {
  return (
    <section className="block">
      <b>{header}</b>
      {children}
      <small>{footer}</small>
    </section>
  );
}

export default Section;
