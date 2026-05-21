"use client"

import { useState, useRef } from "react"

interface NutritionResult {
  name?: string
  weight?: number
  calories?: number
  protein?: number
  fat?: number
  carbs?: number
  confidence?: string
  error?: string
}

export default function FoodAnalyzer({ onSaved }: { onSaved?: () => void }) {
  const [image, setImage] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<NutritionResult | null>(null)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError("图片不能超过 5MB")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setImage(reader.result as string)
      setResult(null)
      setError("")
      setSaved(false)
    }
    reader.readAsDataURL(file)
  }

  async function analyze() {
    if (!image) return
    setAnalyzing(true)
    setError("")
    try {
      const res = await fetch("/api/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "分析失败")
        return
      }
      setResult(data)
    } catch {
      setError("网络错误，请重试")
    } finally {
      setAnalyzing(false)
    }
  }

  async function saveToDiet() {
    if (!result) return
    setSaving(true)
    try {
      const today = new Date().toISOString().split("T")[0]
      await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: result.name || "未知食物",
          calories: result.calories || 0,
          protein: result.protein || 0,
          fat: result.fat || 0,
          carbs: result.carbs || 0,
          date: today,
          mealType: "snack",
        }),
      })
      setSaved(true)
      onSaved?.()
    } catch {
      setError("保存失败")
    } finally {
      setSaving(false)
    }
  }

  const confidenceColor: Record<string, string> = {
    high: "text-green-600 bg-green-50",
    medium: "text-yellow-600 bg-yellow-50",
    low: "text-red-600 bg-red-50",
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
      <h3 className="font-semibold text-gray-800">📸 拍照分析食物</h3>
      <p className="text-xs text-gray-400">拍下食物照片，AI 自动识别并计算热量和营养成分</p>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
      )}

      {/* Image upload / preview */}
      {!image ? (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-300 rounded-xl py-10 text-center hover:border-orange-400 hover:bg-orange-50/50 transition group"
        >
          <div className="text-4xl mb-2">📷</div>
          <div className="text-sm text-gray-500 group-hover:text-orange-600">
            点击拍照或选择照片
          </div>
          <div className="text-xs text-gray-400 mt-1">支持 JPG、PNG，不超过 5MB</div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFile}
            className="hidden"
          />
        </button>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden bg-gray-100">
            <img
              src={image}
              alt="Food"
              className="w-full h-64 object-cover"
            />
            <button
              onClick={() => { setImage(null); setResult(null) }}
              className="absolute top-2 right-2 bg-black/50 text-white w-8 h-8 rounded-full text-sm hover:bg-black/70"
            >
              ✕
            </button>
          </div>

          {!result && !analyzing && (
            <button
              onClick={analyze}
              className="w-full bg-orange-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-orange-600 transition"
            >
              🔍 开始分析
            </button>
          )}

          {analyzing && (
            <div className="flex flex-col items-center py-6 space-y-3">
              <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
              <p className="text-sm text-gray-500">AI 正在分析食物...</p>
            </div>
          )}

          {/* Results */}
          {result && !analyzing && (
            <div className="space-y-4">
              {result.error ? (
                <div className="text-center py-4">
                  <p className="text-gray-400">{result.error}</p>
                  <button onClick={() => setImage(null)} className="text-sm text-orange-500 mt-2 hover:underline">重新拍照</button>
                </div>
              ) : (
                <>
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-gray-800 text-lg">{result.name || "食物"}</h4>
                      {result.confidence && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${confidenceColor[result.confidence] || "text-gray-500 bg-gray-100"}`}>
                          {result.confidence === "high" ? "高置信度" : result.confidence === "medium" ? "中置信度" : "低置信度"}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/80 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-orange-600">{result.calories || 0}</div>
                        <div className="text-xs text-gray-500">卡路里 (kcal)</div>
                      </div>
                      <div className="bg-white/80 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-gray-700">{result.weight || 0}<span className="text-sm font-normal text-gray-400">g</span></div>
                        <div className="text-xs text-gray-500">估计重量</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div className="bg-white/80 rounded-lg p-2 text-center">
                        <div className="text-sm font-bold text-blue-600">{result.protein || 0}g</div>
                        <div className="text-xs text-gray-400">蛋白质</div>
                      </div>
                      <div className="bg-white/80 rounded-lg p-2 text-center">
                        <div className="text-sm font-bold text-red-500">{result.fat || 0}g</div>
                        <div className="text-xs text-gray-400">脂肪</div>
                      </div>
                      <div className="bg-white/80 rounded-lg p-2 text-center">
                        <div className="text-sm font-bold text-amber-600">{result.carbs || 0}g</div>
                        <div className="text-xs text-gray-400">碳水</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => { setImage(null); setResult(null) }}
                      className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition"
                    >
                      重新拍照
                    </button>
                    <button
                      onClick={saveToDiet}
                      disabled={saving || saved}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
                        saved
                          ? "bg-green-100 text-green-600"
                          : "bg-orange-500 text-white hover:bg-orange-600"
                      } disabled:opacity-50`}
                    >
                      {saved ? "✓ 已保存" : saving ? "保存中..." : "保存到饮食记录"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
