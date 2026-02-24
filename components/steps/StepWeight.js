import { View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet } from 'react-native';
import { stepStyles as styles } from '../../constants/styles';

export default function StepWeight({ weight, targetWeight, onChangeWeight, onChangeTarget, onNext, onBack }) {
  const isValid = weight && targetWeight;
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <View style={styles.container}>
      <Text style={styles.title}>体重を入力してください</Text>

      <Text style={styles.label}>現在の体重</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={weight}
          onChangeText={onChangeWeight}
          placeholder="例：70"
        />
        <Text style={styles.unit}>kg</Text>
      </View>

      <Text style={styles.label}>理想の体重</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={targetWeight}
          onChangeText={onChangeTarget}
          placeholder="例：65"
        />
        <Text style={styles.unit}>kg</Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity onPress={onBack}><Text>← 戻る</Text></TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextButton, !isValid && styles.disabled]}
          onPress={onNext}
          disabled={!isValid}
        ><Text>次へ →</Text></TouchableOpacity>
      </View>
    </View>
    </TouchableWithoutFeedback>
  );
}