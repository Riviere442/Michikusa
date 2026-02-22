import { StyleSheet } from 'react-native';

export const stepStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, padding: 24 },
  title: { fontSize: 20, marginBottom: 24 },
  label: { alignSelf: 'flex-start', fontSize: 16, marginTop: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, width: 150, fontSize: 18 },
  unit: { fontSize: 18 },
  option: { padding: 16, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, width: 280, alignItems: 'center' },
  optionLabel: { fontSize: 16, fontWeight: 'bold' },
  optionDesc: { fontSize: 12, color: '#888' },
  selected: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  buttons: { flexDirection: 'row', alignItems: 'center', gap: 24, marginTop: 32 },
  nextButton: { padding: 16, backgroundColor: '#4CAF50', borderRadius: 8 },
  disabled: { backgroundColor: '#ccc' },
});