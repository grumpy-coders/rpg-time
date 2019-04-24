function mySettings(props) {
  return (
    <Page>
      <Section
        title={<Text bold align="center">RPG Time Settings</Text>}>
        <Toggle
          label="Enable Sleep Mode"
          settingsKey="sleepModeEnabled"          
        />
        
        <TextInput
              settingsKey="sleepModeStartTime"
              title="Sleep Mode Start Time"
              label="Enter sleep mode start time."
              type ="time"
        />
        
        <TextInput
              settingsKey="sleepModeEndTime"
              title="Sleep Mode End Time"
              label="Enter sleep mode end time."
              type ="time"
        />

      </Section>
    </Page>
  );
}

registerSettingsPage(mySettings);
