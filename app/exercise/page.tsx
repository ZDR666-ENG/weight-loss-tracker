"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { exerciseTypes, calcCalories } from "@/lib/exercise"
import ExerciseReminder from "@/components/ExerciseReminder"

interface ExerciseLog {
  id: string
  type: string
  duration: number
  calories: number
  date: string
  note: string | null
}

const dayLabels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]

export default function ExercisePage() {
  const router = useRouter()
  const [logs, setLogs] = useState<ExerciseLog[]>([])
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [type, setType] = useState("running_8")
  const [duration, setDuration] = useState("30")
  const [note, setNote] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [userWeight, setUserWeight] = useState(70)

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (d.user) {
        setUserWeight(d.user.weight || 70)
        loadLogs()
      } else {
        router.push("/auth/login")
      }
    }).finally(() => setAuthChecked(true))
  }, [])

  useEffect(() => { if (authChecked) loadLogs() }, [date])

  async function loadLogs() {
    const res = await fetch(`/api/exercises?date=${date}`)
    const data = await res.json()
    setLogs(data.logs || [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, duration: parseInt(duration), date, note }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setDuration("30")
      setNote("")
      loadLogs()
    } catch {
      setError("添加失败")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    await fetch("/api/exercises", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    loadLogs()
  }

  const totalCalories = logs.reduce((s, l) => s + l.calories, 0)
  const previewCal = calcCalories(type, parseInt(duration) || 0, userWeight)

  if (!authChecked) {
    return <div className="flex min-h-screen items-center justify-center"><p className="text-gray-400">加载中...</p></div>
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-800">🏃 运动记录</h2>

      {/* Date + Summary */}
      <div className="flex flex-wrap items-center gap-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-200"
        />
        <span className="text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium">
          今日消耗 {totalCalories} kcal
        </span>
        {logs.length > 0 && (
          <span className="text-sm text-gray-400">
            共 {logs.length} 次运动 · {logs.reduce((s, l) => s + l.duration, 0)} 分钟
          </span>
        )}
      </div>

      {/* Reminder Settings */}
      <ExerciseReminder />

      {/* Add Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
        <h3 className="font-semibold text-gray-700">记录运动</h3>
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">运动类型</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            >
              {exerciseTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">时长 (分钟)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              placeholder="例如: 30"
              min="1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">预计消耗</label>
            <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-orange-600 font-semibold">
              {previewCal} kcal
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            placeholder="运动感受..."
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto bg-orange-500 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 transition"
        >
          {loading ? "添加中..." : "添加运动"}
        </button>
      </form>

      {/* Exercise Logs */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 运动记录</h3>
        {logs.length === 0 ? (
          <p className="text-gray-400 text-sm">今天还没有运动记录</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{exerciseTypes.find(t => t.value === log.type)?.icon || "🏃"}</span>
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      {exerciseTypes.find(t => t.value === log.type)?.label || log.type}
                    </span>
                    {log.note && <span className="text-xs text-gray-400 ml-2">— {log.note}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{log.duration}分钟</span>
                  <span className="text-sm font-semibold text-orange-600">{log.calories} kcal</span>
                  <button onClick={() => handleDelete(log.id)} className="text-red-400 hover:text-red-600 text-xs">删除</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
