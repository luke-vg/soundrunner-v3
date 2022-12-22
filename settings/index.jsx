function ageDefinition(props) {
  return (
    <TextInput
    label="Age"
    settingsKey="textInput"
    type="number"
    />
  );
}
registerSettingsPage(ageDefinition);