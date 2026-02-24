import { View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { stepStyles as styles } from '../../constants/styles';

export default function StepNickname({ value, onChange, onNext, onBack }) {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>ニックネームを入力してください</Text>

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder="例：たろう"
          maxLength={20}
        />

        <View style={styles.buttons}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← ログイン前に戻る</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.nextButton, !value && styles.disabled]}
            onPress={onNext}
            disabled={!value}
          >
            <Text style={styles.nextButtonText}>次へ →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
