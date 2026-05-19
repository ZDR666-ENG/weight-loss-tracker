"use client"

import { useEffect, useState } from "react"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [form, setForm] = useState({ name: "", height: "", weight: "", age: "", gender: "", goalWeight: "" })
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (d.user) {
        setUser(d.user)
        setForm({
          name: d.user.name || "",
          height: d.user.height?.toString() || "",
          weight: d.user.weight?.toString() || "",
          age: d.user.age?.toString() || "",
          gender: d.user.gender || "",
          goalWeight: d.user.goalWeight?.toString() || "",
        })
      }
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage("")
    setLoading(true)
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage("保存成功！")
        setUser(data.user)
      } else {
        setMessage(data.error || "保存失败")
      }
    } catch {
      setMessage("网络错误")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-800">👤 个人资料</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
        {message && (
          <div className={`text-sm p-3 rounded-lg ${message.includes("成功") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
            <input type="text" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
            <input type="email" value={user?.email || ""} disabled
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">身高 (cm)</label>
            <input type="number" value={form.height}
              onChange={(e) => setForm({ ...form, height: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              placeholder="例如: 170" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">当前体重 (kg)</label>
            <input type="number" step="0.1" value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              placeholder="例如: 70" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">年龄</label>
            <input type="number" value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              placeholder="例如: 25" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">性别</label>
            <select value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200">
              <option value="">请选择</option>
              <option value="male">男</option>
              <option value="female">女</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">目标体重 (kg)</label>
            <input type="number" step="0.1" value={form.goalWeight}
              onChange={(e) => setForm({ ...form, goalWeight: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              placeholder="例如: 60" />
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full md:w-auto bg-emerald-500 text-white px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-600 disabled:opacity-50 transition">
          {loading ? "保存中..." : "保存修改"}
        </button>
      </form>
    </div>
  )
}
