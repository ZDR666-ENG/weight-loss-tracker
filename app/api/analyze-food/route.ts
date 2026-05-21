import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { cookies } from "next/headers"

// Qwen DashScope API (OpenAI-compatible, free tier, accessible from China)
const BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1"
const MODEL = "qwen-vl-plus"

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  const userId = token ? await verifyToken(token) : null
  if (!userId) return NextResponse.json({ error: "请先登录" }, { status: 401 })

  const apiKey = process.env.DASHSCOPE_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "AI 服务未配置，请在 Vercel 设置 DASHSCOPE_API_KEY" }, { status: 503 })
  }

  try {
    const { image } = await request.json()
    if (!image) return NextResponse.json({ error: "未提供图片" }, { status: 400 })

    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 512,
        messages: [
          {
            role: "system",
            content: `你是一个专业营养师。根据食物图片分析营养，只返回一个JSON对象（不要markdown代码块）：
{"name":"食物中文名","weight":估计克数,"calories":千卡,"protein":蛋白质克,"fat":脂肪克,"carbs":碳水克,"confidence":"high/medium/low"}
无法识别时返回：{"error":"无法识别食物，请重试"}`,
          },
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: image } },
              { type: "text", text: "分析这份食物的营养成分" },
            ],
          },
        ],
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      console.error("Qwen API error:", JSON.stringify(data))
      return NextResponse.json({ error: "AI 服务异常，请重试" }, { status: 500 })
    }

    const text = data.choices?.[0]?.message?.content || ""
    // Extract JSON from response (may contain markdown code fences)
    const cleanText = text.replace(/```json\s*|```\s*/g, "").trim()
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error("Qwen returned non-JSON:", text)
      throw new Error("AI 返回格式异常")
    }

    const result = JSON.parse(jsonMatch[0])
    if (result.error) {
      return NextResponse.json(result)
    }
    return NextResponse.json(result)
  } catch (err: any) {
    console.error("Food analysis error:", err)
    return NextResponse.json(
      { error: err.message || "分析失败，请重试" },
      { status: 500 }
    )
  }
}
