"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { exerciseTypes, calcCalories } from "@/lib/exercise"
import ExerciseReminder from "@/components/ExerciseReminder"

interface Plan {
  id?: string
  dayOfWeek: number
  type: string
  duration: number
  calories: number
  note: string | null
}

const dayLabels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
const dayEmojis = ["🏋️", "💪", "🔥", "🎯", "⚡", "🌟", "🎉"]

export default function ExercisePlanPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])
  const [userWeight, setUserWeight] = useState(70)
  const [authChecked, setAuthChecked] = useState(false)
  const [saving, setSaving] = useState<number | null>(null)
  const [message, setMessage] = useState("")

  // Local form state per day
  const [forms, setForms] = useState<Record<number, { type: string; duration: string; note: string }>>({})

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (d.user) {
        setUserWeight(d.user.weight || 70)
        loadPlans()
      } else {
        router.push("/auth/login")
      }
    }).finally(() => setAuthChecked(true))
  }, [])

  async function loadPlans() {
    const res = await fetch("/api/exercise-plan")
    const data = await res.json()
    setPlans(data.plans || [])

    const initForms: Record<number, { type: string; duration: string; note: string }> = {}
    for (let i = 0; i < 7; i++) {
      const p = (data.plans || []).find((pl: Plan) => pl.dayOfWeek === i)
      initForms[i] = {
        type: p?.type || "running_8",
        duration: p?.duration?.toString() || "30",
        note: p?.note || "",
      }
    }
    setForms(initForms)
  }

  async function handleSave(dayOfWeek: number) {
    const form = forms[dayOfWeek]
    if (!form) return

    setSaving(dayOfWeek)
    setMessage("")

    const duration = parseInt(form.duration) || 0
    const calories = calcCalories(form.type, duration, userWeight)

    try {
      const res = await fetch("/api/exercise-plan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dayOfWeek, type: form.type, duration, calories, note: form.note }),
      })
      if (!res.ok) {
        setMessage("保存失败")
        return
      }
      setMessage("保存成功！")
      loadPlans()
    } catch {
      setMessage("网络错误")
    } finally {
      setSaving(null)
      setTimeout(() => setMessage(""), 3000)
    }
  }

  const totalWeekCalories = plans.reduce((s, p) => s + p.calories, 0)
  const totalWeekMinutes = plans.reduce((s, p) => s + p.duration, 0)

  if (!authChecked) {
    return <div className="flex min-h-screen items-center justify-center"><p className="text-gray-400">加载中...</p></div>
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">📅 每周运动计划</h2>
        <div className="flex gap-4 text-sm">
          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium">
            共 {totalWeekCalories} kcal
          </span>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
            {totalWeekMinutes} 分钟
          </span>
        </div>
      </div>

      {message && (
        <div className={`text-sm p-3 rounded-lg ${message.includes("成功") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
          {message}
        </div>
      )}

      <ExerciseReminder />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dayLabels.map((day, i) => {
          const form = forms[i] || { type: "running_8", duration: "30", note: "" }
          const cal = calcCalories(form.type, parseInt(form.duration) || 0, userWeight)
          const savedPlan = plans.find((p) => p.dayOfWeek === i)

          return (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800">
                  {dayEmojis[i]} {day}
                </h3>
                {savedPlan && (
                  <span className="text-xs text-orange-500 font-medium">已计划</span>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">运动类型</label>
                <select
                  value={form.type}
                  onChange={(e) => setForms({ ...forms, [i]: { ...form, type: e.target.value } })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-orange-400"
                >
                  {exerciseTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">时长 (分钟)</label>
                <input
                  type="number"
                  value={form.duration}
                  onChange={(e) => setForms({ ...forms, [i]: { ...form, duration: e.target.value } })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-orange-400"
                  min="1"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">备注</label>
                <input
                  type="text"
                  value={form.note}
                  onChange={(e) => setForms({ ...forms, [i]: { ...form, note: e.target.value } })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-orange-400"
                  placeholder="地点/强度..."
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-sm font-bold text-orange-600">{cal} kcal</span>
                <button
                  onClick={() => handleSave(i)}
                  disabled={saving === i}
                  className="bg-orange-500 text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-orange-600 disabled:opacity-50 transition"
                >
                  {saving === i ? "保存中..." : "保存"}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-3">📊 运动消耗参考</h3>
        <p className="text-sm text-gray-500 mb-4">
          基于你的体重 <span className="font-semibold text-gray-700">{userWeight}kg</span> 计算 · 公式: MET × 体重(kg) × 时长(h)
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {exerciseTypes.slice(0, 8).map((t) => (
            <div key={t.value} className="bg-gray-50 rounded-lg px-3 py-2 text-center">
              <span className="text-xs text-gray-500 block">{t.icon}</span>
              <span className="text-xs font-medium text-gray-700">{calcCalories(t.value, 30, userWeight)} kcal</span>
              <span className="text-xs text-gray-400">/30分钟</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
