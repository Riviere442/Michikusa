import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import StepGender from '../components/steps/StepGender';
import StepAge from '../components/steps/StepAge';
import StepHeight from '../components/steps/StepHeight';
import StepWeight from '../components/steps/StepWeight';
import StepDays from '../components/steps/StepDays';
import StepActivityLevel from '../components/steps/StepActivityLevel';
import StepDetourLevel from '../components/steps/StepDetourLevel';
import StepNickname from '../components/steps/StepNickname';
import DevSkipButton from '../components/DevSkipButton';
import { useUser } from '../contexts/UserContext';
import { saveProfile } from '../lib/supabase';

export default function SetupScreen() {
  const { setUserData: saveToContext } = useUser();
  const [step, setStep] = useState(0);
  const [userData, setUserData] = useState({
    nickname: '',
    gender: null,
    age: '',
    height: '',
    weight: '',
    targetWeight: '',
    days: '',
    activityLevel: null,
    detourLevel: null,
  });
  const handleComplete = async () => {
    const { error } = await saveProfile(userData);
    if (error) {
      console.log('プロフィール保存エラー:', error);
      Alert.alert('保存エラー', 'データの保存に失敗しました。もう一度お試しください。');
      return;
    }
    saveToContext(userData);
    router.push('/home');
  };
  // developer mode
  const handleDevSkip = async (devData) => {
    setUserData(devData);
    const { error } = await saveProfile(devData);
    if (error) {
      console.log('プロフィール保存エラー(dev):', error);
    }
    saveToContext(devData);
    router.push('/home');
  };

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);
  const update = (key, value) => setUserData(prev => ({ ...prev, [key]: value }));

  const steps = [
    <StepNickname value={userData.nickname} onChange={v => update('nickname', v)} onNext={next} onBack={() => router.replace('/login')} />,
    <StepGender value={userData.gender} onSelect={v => update('gender', v)} onNext={next} onBack={back} />,
    <StepAge value={userData.age} onChange={v => update('age', v)} onNext={next} onBack={back} />,
    <StepHeight value={userData.height} onChange={v => update('height', v)} onNext={next} onBack={back} />,
    <StepWeight
      weight={userData.weight}
      targetWeight={userData.targetWeight}
      onChangeWeight={v => update('weight', v)}
      onChangeTarget={v => update('targetWeight', v)}
      onNext={next}
      onBack={back}
    />,
    <StepDays value={userData.days} onChange={v => update('days', v)} onNext={next} onBack={back} />,
    <StepActivityLevel value={userData.activityLevel} onSelect={v => update('activityLevel', v)} onNext={next} onBack={back} />,
    <StepDetourLevel
      value={userData.detourLevel}
      onSelect={v => update('detourLevel', v)}
      onNext={handleComplete}
      onBack={back}
    />,
  ];

  return (
    <>
      {steps[step]}
      <DevSkipButton onSkip={handleDevSkip} />
    </>
  );
}