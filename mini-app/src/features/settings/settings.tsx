import FixedLayout from "@components/fixed-layout";
import List from "@components/list";
import Section from "@components/section";

function Settings() {
  return (
    <FixedLayout vertical="top">
      <List>
        <Section header="Settings" footer="settings">
          <p>Settings page content goes here.</p>
        </Section>
      </List>
    </FixedLayout>
  );
}
export default Settings;
