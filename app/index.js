import { useState } from 'react';
import { router } from 'expo-router';
import StepGender from '../components/steps/StepGender';
import StepAge from '../components/steps/StepAge';
import StepHeight from '../components/steps/StepHeight';
import StepWeight from '../components/steps/StepWeight';
import StepDays from '../components/steps/StepDays';
import StepActivityLevel from '../components/steps/StepActivityLevel';
import StepDetourLevel from '../components/steps/StepDetourLevel';
import DevSkipButton from '../components/DevSkipButton';

export default function SetupScreen() {
  const [step, setStep] = useState(0);
  const [userData, setUserData] = useState({
    gender: null,
    age: '',
    height: '',
    weight: '',
    targetWeight: '',
    days: '',
    activityLevel: null,
    detourLevel: null,
  });
  const handleComplete = () => {
  router.push('/home');
  };
  // developer mode
  const handleDevSkip = (devData) => {
    setUserData(devData);
    router.push('/home');
  };


  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);
  const update = (key, value) => setUserData(prev => ({ ...prev, [key]: value }));

  const steps = [
    <StepGender value={userData.gender} onSelect={v => update('gender', v)} onNext={next} />,
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
    <StepDetourLevel value={userData.detourLevel} onSelect={v => update('detourLevel', v)} onNext={next} onBack={back} />,
    <StepDetourLevel
      value={userData.detourLevel}
      onSelect={v => update('detourLevel', v)}
      onNext={handleComplete}  // ← nextからhandleCompleteに変更
      onBack={back}
    />
  ];

  return (
    <>
      {steps[step]}
      <DevSkipButton onSkip={handleDevSkip} />
    </>
  );
}