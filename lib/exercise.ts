// MET (Metabolic Equivalent of Task) values
// 1 MET = 1 kcal / kg / hour
const metValues: Record<string, number> = {
  running_8: 8,
  running_10: 10,
  running_12: 12,
  walking_5: 3.5,
  walking_6: 5,
  cycling_16: 6,
  cycling_20: 8,
  swimming_moderate: 7,
  swimming_vigorous: 10,
  jump_rope: 12,
  hiit: 8,
  yoga: 2.5,
  strength_training: 5,
  basketball: 6.5,
  badminton: 5.5,
  table_tennis: 4,
  football: 7,
  tennis: 7.3,
  hiking: 6,
  dancing: 5,
  rowing: 7,
  stair_climbing: 9,
}

export const exerciseTypes = [
  { value: "running_8", label: "🏃 跑步 (8km/h)", icon: "🏃", met: 8 },
  { value: "running_10", label: "🏃 跑步 (10km/h)", icon: "🏃", met: 10 },
  { value: "running_12", label: "🏃 跑步 (12km/h)", icon: "🏃", met: 12 },
  { value: "walking_5", label: "🚶 快走 (5km/h)", icon: "🚶", met: 3.5 },
  { value: "walking_6", label: "🚶 健走 (6.5km/h)", icon: "🚶", met: 5 },
  { value: "cycling_16", label: "🚴 骑行 (16-19km/h)", icon: "🚴", met: 6 },
  { value: "cycling_20", label: "🚴 骑行 (20-22km/h)", icon: "🚴", met: 8 },
  { value: "swimming_moderate", label: "🏊 游泳 (中速)", icon: "🏊", met: 7 },
  { value: "swimming_vigorous", label: "🏊 游泳 (快速)", icon: "🏊", met: 10 },
  { value: "jump_rope", label: "🪢 跳绳", icon: "🪢", met: 12 },
  { value: "hiit", label: "🔥 HIIT", icon: "🔥", met: 8 },
  { value: "yoga", label: "🧘 瑜伽", icon: "🧘", met: 2.5 },
  { value: "strength_training", label: "🏋️ 力量训练", icon: "🏋️", met: 5 },
  { value: "basketball", label: "🏀 篮球", icon: "🏀", met: 6.5 },
  { value: "badminton", label: "🏸 羽毛球", icon: "🏸", met: 5.5 },
  { value: "table_tennis", label: "🏓 乒乓球", icon: "🏓", met: 4 },
  { value: "football", label: "⚽ 足球", icon: "⚽", met: 7 },
  { value: "tennis", label: "🎾 网球", icon: "🎾", met: 7.3 },
  { value: "hiking", label: "🥾 徒步", icon: "🥾", met: 6 },
  { value: "dancing", label: "💃 跳舞", icon: "💃", met: 5 },
  { value: "rowing", label: "🚣 划船机", icon: "🚣", met: 7 },
  { value: "stair_climbing", label: "🪜 爬楼梯", icon: "🪜", met: 9 },
]

export function calcCalories(type: string, durationMinutes: number, weightKg: number): number {
  const met = metValues[type] || 5
  return Math.round(met * weightKg * (durationMinutes / 60))
}

export function getExerciseLabel(type: string): string {
  return exerciseTypes.find((e) => e.value === type)?.label || type
}
