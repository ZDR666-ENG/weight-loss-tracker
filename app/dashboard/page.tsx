"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import Link from "next/link"

interface WeightLog {
  id: string
  weight: number
  recordedAt: string
}

interface Meal {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  mealType: string
}

export default function DashboardPage() {
  const [weights, setWeights] = useState<WeightLog[]>([])
  const [meals, setMeals] = useState<Meal[]>([])
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUser(d.user))
    fetch("/api/weight").then((r) => r.json()).then((d) => setWeights(d.logs || []))
    fetch("/api/meals").then((r) => r.json()).then((d) => setMeals(d.meals || []))
  }, [])

  const todayCalories = meals.reduce((sum, m) => sum + m.calories, 0)
  const todayProtein = meals.reduce((sum, m) => sum + m.protein, 0)
  const todayCarbs = meals.reduce((sum, m) => sum + m.carbs, 0)
  const todayFat = meals.reduce((sum, m) => sum + m.fat, 0)
  const latestWeight = weights[0]?.weight || user?.weight || "—"
  const goalWeight = user?.goalWeight

  const chartData = [...weights]
    .reverse()
    .slice(-14)
    .map((w) => ({
      date: new Date(w.recordedAt).toLocaleDateString("zh-CN", { month: "short", day: "numeric" }),
      weight: w.weight,
    }))

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-800">
        👋 你好，{user?.name || "..."}
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">当前体重</p>
          <p className="text-2xl font-bold text-gray-800">{latestWeight} <span className="text-sm font-normal text-gray-400">kg</span></p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">目标体重</p>
          <p className="text-2xl font-bold text-emerald-600">{goalWeight || "—"} <span className="text-sm font-normal text-gray-400">kg</span></p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">今日摄入</p>
          <p className="text-2xl font-bold text-orange-500">{todayCalories} <span className="text-sm font-normal text-gray-400">kcal</span></p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">蛋白质</p>
          <p className="text-2xl font-bold text-blue-500">{todayProtein}<span className="text-sm font-normal text-gray-400">g</span></p>
        </div>
      </div>

      {/* Weight Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 体重趋势（近14天）</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-sm py-8 text-center">还没有体重记录，去<a href="/weight" className="text-emerald-500 underline">记录体重</a>吧</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/weight" className="bg-emerald-500 text-white rounded-xl p-4 text-center font-medium hover:bg-emerald-600 transition">
          ⚖️ 记录体重
        </Link>
        <Link href="/diet" className="bg-orange-500 text-white rounded-xl p-4 text-center font-medium hover:bg-orange-600 transition">
          🍽️ 记录饮食
        </Link>
        <Link href="/calculator" className="bg-blue-500 text-white rounded-xl p-4 text-center font-medium hover:bg-blue-600 transition">
          📐 BMI计算
        </Link>
        <Link href="/community" className="bg-purple-500 text-white rounded-xl p-4 text-center font-medium hover:bg-purple-600 transition">
          👥 社区
        </Link>
      </div>

      {/* Today's Meals Summary */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">🍽️ 今日饮食概览</h3>
        {meals.length === 0 ? (
          <p className="text-gray-400 text-sm">今天还没有记录饮食</p>
        ) : (
          <div className="space-y-2">
            {meals.map((m) => (
              <div key={m.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-700">{m.name}</span>
                <span className="text-sm font-medium text-gray-800">{m.calories} kcal</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-200">
              <span className="text-sm font-semibold text-gray-700">合计</span>
              <div className="text-xs text-gray-500 space-x-3">
                <span>碳水 {todayCarbs}g</span>
                <span>脂肪 {todayFat}g</span>
                <span>蛋白质 {todayProtein}g</span>
                <span className="text-sm font-bold text-gray-800 ml-2">{todayCalories} kcal</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
