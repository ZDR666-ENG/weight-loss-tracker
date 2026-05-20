"use client"

import { useExerciseReminder } from "@/hooks/useExerciseReminder"

export default function ExerciseReminder() {
  const { permission, settings, requestPermission, updateSettings } = useExerciseReminder()

  function toggleEnabled() {
    if (!settings.enabled && permission !== "granted") {
      requestPermission().then((result) => {
        if (result === "granted") {
          updateSettings({ enabled: true })
        }
      })
    } else {
      updateSettings({ enabled: !settings.enabled })
    }
  }

  function addTime() {
    const newTimes = [...settings.times, "09:00"]
    updateSettings({ times: newTimes })
  }

  function updateTime(index: number, value: string) {
    const newTimes = [...settings.times]
    newTimes[index] = value
    updateSettings({ times: newTimes })
  }

  function removeTime(index: number) {
    const newTimes = settings.times.filter((_, i) => i !== index)
    updateSettings({ times: newTimes })
  }

  const browserSupported = typeof window !== "undefined" && "Notification" in window

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-800">🔔 浏览器提醒</h3>
          <p className="text-xs text-gray-400 mt-0.5">根据每日计划定时提醒你运动</p>
        </div>
        <button
          onClick={toggleEnabled}
          disabled={!browserSupported}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
            settings.enabled ? "bg-orange-500" : "bg-gray-200"
          } disabled:opacity-40`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              settings.enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {!browserSupported && (
        <p className="text-xs text-red-500">你的浏览器不支持通知功能</p>
      )}

      {permission === "denied" && (
        <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">
          通知权限已被拒绝。请在浏览器设置中允许通知后重新开启。
        </p>
      )}

      {settings.enabled && (
        <div className="space-y-3 pt-2 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500">提醒时间</p>
          {settings.times.map((time, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="time"
                value={time}
                onChange={(e) => updateTime(i, e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-orange-400"
              />
              {settings.times.length > 1 && (
                <button
                  onClick={() => removeTime(i)}
                  className="text-gray-300 hover:text-red-400 text-sm"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {settings.times.length < 5 && (
            <button
              onClick={addTime}
              className="text-xs text-orange-500 hover:text-orange-600 font-medium"
            >
              + 添加提醒时间
            </button>
          )}
          <p className="text-xs text-gray-400">
            浏览器会定时检查今日运动计划，未完成时弹出提醒
          </p>
        </div>
      )}
    </div>
  )
}
