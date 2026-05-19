"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface WeightLog {
  id: string
  weight: number
  recordedAt: string
  note: string | null
}

export default function WeightPage() {
  const [logs, setLogs] = useState<WeightLog[]>([])
  const [weight, setWeight] = useState("")
  const [note, setNote] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function loadLogs() {
    const res = await fetch("/api/weight")
    const data = await res.json()
    setLogs(data.logs || [])
  }

  useEffect(() => { loadLogs() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight, note, recordedAt: date }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setWeight("")
      setNote("")
      setDate(new Date().toISOString().split("T")[0])
      await loadLogs()
    } catch {
      setError("提交失败")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    await fetch("/api/weight", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    loadLogs()
  }

  const chartData = [...logs].reverse().map((w) => ({
    date: new Date(w.recordedAt).toLocaleDateString("zh-CN", { month: "short", day: "numeric" }),
    weight: w.weight,
  }))

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-800">⚖️ 体重记录</h2>

      {/* Add Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">体重 (kg)</label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              placeholder="例如: 70.5"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              placeholder="今天运动了..."
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto bg-emerald-500 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-600 disabled:opacity-50 transition"
        >
          {loading ? "保存中..." : "记录体重"}
        </button>
      </form>

      {/* Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 体重趋势</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-sm py-8 text-center">还没有体重记录</p>
        )}
      </div>

      {/* History */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 历史记录</h3>
        {logs.length === 0 ? (
          <p className="text-gray-400 text-sm">暂无记录</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <span className="text-sm text-gray-500">{new Date(log.recordedAt).toLocaleDateString("zh-CN")}</span>
                  {log.note && <span className="text-sm text-gray-400 ml-3">— {log.note}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-800">{log.weight} kg</span>
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
