"use client"

import { useState } from "react"

export default function CalculatorPage() {
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState("male")
  const [result, setResult] = useState<{ bmi: number; bmr: number; category: string } | null>(null)

  function calculate() {
    const h = parseFloat(height) / 100 // cm to m
    const w = parseFloat(weight)
    const a = parseInt(age)

    if (!h || !w || h <= 0 || w <= 0) return

    const bmi = w / (h * h)
    let category = ""
    if (bmi < 18.5) category = "偏瘦"
    else if (bmi < 24) category = "正常"
    else if (bmi < 28) category = "偏胖"
    else category = "肥胖"

    let bmr = 0
    if (gender === "male") {
      bmr = 10 * w + 6.25 * (h * 100) - 5 * a + 5
    } else {
      bmr = 10 * w + 6.25 * (h * 100) - 5 * a - 161
    }

    setResult({ bmi: Math.round(bmi * 10) / 10, bmr: Math.round(bmr), category })
  }

  const categoryColors: Record<string, string> = {
    "偏瘦": "text-blue-600 bg-blue-50",
    "正常": "text-green-600 bg-green-50",
    "偏胖": "text-orange-600 bg-orange-50",
    "肥胖": "text-red-600 bg-red-50",
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-800">📐 BMI & BMR 计算器</h2>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">身高 (cm)</label>
            <input type="number" value={height} onChange={(e) => setHeight(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="例如: 170" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">体重 (kg)</label>
            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="例如: 65" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">年龄</label>
            <input type="number" value={age} onChange={(e) => setAge(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="例如: 25" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">性别</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
              <option value="male">男</option>
              <option value="female">女</option>
            </select>
          </div>
        </div>

        <button onClick={calculate}
          className="w-full bg-blue-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-600 transition">
          计算
        </button>

        {result && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">BMI</p>
              <p className="text-3xl font-bold text-gray-800">{result.bmi}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">BMR (基础代谢)</p>
              <p className="text-3xl font-bold text-gray-800">{result.bmr} <span className="text-sm font-normal text-gray-400">kcal/天</span></p>
            </div>
            <div className="text-center flex flex-col justify-center">
              <p className="text-xs text-gray-500 mb-1">体型</p>
              <span className={`inline-block mx-auto px-4 py-1 rounded-full text-sm font-semibold ${categoryColors[result.category]}`}>
                {result.category}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* BMI Reference */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-3">📊 BMI 参考标准（中国）</h3>
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-blue-50 rounded-lg p-3"><p className="font-bold text-blue-600">&lt; 18.5</p><p className="text-gray-500 mt-1">偏瘦</p></div>
          <div className="bg-green-50 rounded-lg p-3"><p className="font-bold text-green-600">18.5 - 24</p><p className="text-gray-500 mt-1">正常</p></div>
          <div className="bg-orange-50 rounded-lg p-3"><p className="font-bold text-orange-600">24 - 28</p><p className="text-gray-500 mt-1">偏胖</p></div>
          <div className="bg-red-50 rounded-lg p-3"><p className="font-bold text-red-600">&ge; 28</p><p className="text-gray-500 mt-1">肥胖</p></div>
        </div>
      </div>
    </div>
  )
}
