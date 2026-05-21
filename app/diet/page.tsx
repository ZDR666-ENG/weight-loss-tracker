"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import FoodAnalyzer from "@/components/FoodAnalyzer"

interface Meal {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  mealType: string
  date: string
}

const mealTypes = [
  { value: "breakfast", label: "🥐 早餐" },
  { value: "lunch", label: "🍱 午餐" },
  { value: "dinner", label: "🍲 晚餐" },
  { value: "snack", label: "🍪 零食" },
  { value: "other", label: "📌 其他" },
]

export default function DietPage() {
  const router = useRouter()
  const [meals, setMeals] = useState<Meal[]>([])
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [form, setForm] = useState({ name: "", calories: "", protein: "", carbs: "", fat: "", mealType: "other" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  async function loadMeals() {
    const res = await fetch(`/api/meals?date=${date}`)
    const data = await res.json()
    setMeals(data.meals || [])
  }

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (!d.user) router.push("/auth/login")
    }).finally(() => setAuthChecked(true))
  }, [])

  useEffect(() => { if (authChecked) loadMeals() }, [date])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, date }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setForm({ name: "", calories: "", protein: "", carbs: "", fat: "", mealType: "other" })
      await loadMeals()
    } catch {
      setError("添加失败")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    await fetch("/api/meals", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    loadMeals()
  }

  const totalCalories = meals.reduce((s, m) => s + m.calories, 0)
  const totalProtein = meals.reduce((s, m) => s + m.protein, 0)
  const totalCarbs = meals.reduce((s, m) => s + m.carbs, 0)
  const totalFat = meals.reduce((s, m) => s + m.fat, 0)

  if (!authChecked) {
    return <div className="flex min-h-screen items-center justify-center"><p className="text-gray-400">加载中...</p></div>
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-800">🍽️ 饮食记录</h2>

      {/* Date Picker + Nutrition Summary */}
      <div className="flex flex-wrap items-center gap-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
        />
        <div className="flex gap-4 text-sm">
          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full">{totalCalories} kcal</span>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">蛋白质 {totalProtein}g</span>
          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">碳水 {totalCarbs}g</span>
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full">脂肪 {totalFat}g</span>
        </div>
      </div>

      {/* Add Meal Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
        <h3 className="font-semibold text-gray-700">添加食物</h3>
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="col-span-2 md:col-span-1">
            <input
              type="text"
              placeholder="食物名称"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              required
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="卡路里 (kcal)"
              value={form.calories}
              onChange={(e) => setForm({ ...form, calories: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              required
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="蛋白质 (g)"
              value={form.protein}
              onChange={(e) => setForm({ ...form, protein: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="碳水 (g)"
              value={form.carbs}
              onChange={(e) => setForm({ ...form, carbs: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="脂肪 (g)"
              value={form.fat}
              onChange={(e) => setForm({ ...form, fat: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
          </div>
          <div>
            <select
              value={form.mealType}
              onChange={(e) => setForm({ ...form, mealType: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            >
              {mealTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto bg-orange-500 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 transition"
        >
          {loading ? "添加中..." : "添加食物"}
        </button>
      </form>

      {/* AI Food Analyzer */}
      <FoodAnalyzer onSaved={loadMeals} />

      {/* Meal List */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">今日食物列表</h3>
        {meals.length === 0 ? (
          <p className="text-gray-400 text-sm">今天还没有记录饮食</p>
        ) : (
          <div className="space-y-2">
            {["breakfast", "lunch", "dinner", "snack", "other"].map((type) => {
              const typeMeals = meals.filter((m) => m.mealType === type)
              if (typeMeals.length === 0) return null
              const label = mealTypes.find((t) => t.value === type)?.label || type
              return (
                <div key={type}>
                  <p className="text-sm font-medium text-gray-500 mt-3 mb-1">{label}</p>
                  {typeMeals.map((m) => (
                    <div key={m.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                      <span className="text-sm text-gray-700">{m.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">P:{m.protein} C:{m.carbs} F:{m.fat}</span>
                        <span className="text-sm font-semibold text-gray-800">{m.calories} kcal</span>
                        <button onClick={() => handleDelete(m.id)} className="text-red-400 hover:text-red-600 text-xs">删除</button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
