// 基礎代謝（ハリス・ベネディクトの式）
export function calcBMR(gender, weight, height, age) {
  if (gender === '男性') {
    return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  } else {
    return 447.593 + 9.247 * weight + 3.098 * height - 4.330 * age;
  }
}

// 一日の推定エネルギー必要量
export function calcDailyEnergy(bmr, activityLevel) {
  return bmr * activityLevel;
}

// 一日あたりで減らす必要があるカロリー
export function calcDailyDeficit(currentWeight, targetWeight, days) {
  return (currentWeight - targetWeight) * 7000 / days;
}

// 一日の目標摂取カロリー
export function calcDailyTarget(dailyEnergy, dailyDeficit, detourWeight) {
  const foodWeight = 1.0 - detourWeight;
  return dailyEnergy - dailyDeficit * foodWeight;
}

// 消費カロリー（歩行）
export function calcBurnedCalories(mets, hours, weight) {
  return 1.05 * mets * hours * weight;
}