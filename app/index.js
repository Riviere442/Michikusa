import { useState } from 'react';
import StepGender from '../components/steps/StepGender';
import StepAge from '../components/steps/StepAge';
// ...他のステップも同様にimport

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

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);
  const update = (key, value) => setUserData(prev => ({ ...prev, [key]: value }));

  const steps = [
    <StepGender value={userData.gender} onSelect={v => update('gender', v)} onNext={next} />,
    <StepAge value={userData.age} onChange={v => update('age', v)} onNext={next} onBack={back} />,
    // ...
  ];

  return steps[step];
}