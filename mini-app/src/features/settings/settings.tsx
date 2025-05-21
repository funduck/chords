import { FixedLayout, List, Section } from "@telegram-apps/telegram-ui";

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
