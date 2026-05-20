"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { getExerciseLabel } from "@/lib/exercise"

interface ReminderSettings {
  enabled: boolean
  times: string[] // "08:00", "12:00", "18:00"
}

const STORAGE_KEY = "exercise_reminder"
const defaultSettings: ReminderSettings = {
  enabled: false,
  times: ["08:00", "12:00", "18:00"],
}

function getSettings(): ReminderSettings {
  if (typeof window === "undefined") return defaultSettings
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings
  } catch {
    return defaultSettings
  }
}

function saveSettings(s: ReminderSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

export function useExerciseReminder() {
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [settings, setSettings] = useState<ReminderSettings>(defaultSettings)
  const lastFiredRef = useRef<Record<string, string>>({}) // "08:00" -> "2026-05-20"

  useEffect(() => {
    setPermission(typeof Notification !== "undefined" ? Notification.permission : "denied")
    setSettings(getSettings())
  }, [])

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return "denied" as NotificationPermission
    const result = await Notification.requestPermission()
    setPermission(result)
    return result
  }, [])

  const updateSettings = useCallback((patch: Partial<ReminderSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      saveSettings(next)
      return next
    })
  }, [])

  // Periodic reminder checker — runs every 30 seconds
  useEffect(() => {
    if (!settings.enabled || permission !== "granted") return

    async function checkReminder() {
      const now = new Date()
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
      const today = now.toISOString().split("T")[0]

      // Check if any reminder time matches current time (within 1 minute)
      for (const reminderTime of settings.times) {
        if (timeStr !== reminderTime) continue

        // Don't fire twice for the same time on the same day
        const lastKey = `${reminderTime}`
        if (lastFiredRef.current[lastKey] === today) continue

        // Check today's plan
        try {
          const planRes = await fetch("/api/exercise-plan")
          const planData = await planRes.json()
          const todayPlan = (planData.plans || []).find(
            (p: any) => p.dayOfWeek === (now.getDay() + 6) % 7 // Convert JS day (0=Sun) to our day (0=Mon)
          )

          if (!todayPlan) continue

          // Check today's exercises
          const exRes = await fetch(`/api/exercises?date=${today}`)
          const exData = await exRes.json()
          const todayEx = exData.logs || []

          const plannedType = todayPlan.type
          const plannedDuration = todayPlan.duration

          // Check if user already did the planned exercise today
          const completed = todayEx.some(
            (e: any) => e.type === plannedType && e.duration >= plannedDuration * 0.5
          )

          if (!completed) {
            new Notification("🏃 运动提醒", {
              body: `今日计划：${getExerciseLabel(plannedType)} ${plannedDuration}分钟\n预计消耗 ${todayPlan.calories} kcal — 打开网站开始运动！`,
              icon: "/favicon.ico",
              tag: "exercise-reminder",
              requireInteraction: true,
            })
            lastFiredRef.current[lastKey] = today
          }
        } catch {
          // API not available — skip this check
        }
      }
    }

    checkReminder()
    const interval = setInterval(checkReminder, 30000)
    return () => clearInterval(interval)
  }, [settings.enabled, settings.times, permission])

  return { permission, settings, requestPermission, updateSettings }
}
