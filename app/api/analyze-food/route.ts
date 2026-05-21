import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  const userId = token ? await verifyToken(token) : null
  if (!userId) return NextResponse.json({ error: "请先登录" }, { status: 401 })

  if (!process.env.DEEPSEEK_API_KEY) {
    return NextResponse.json({ error: "AI 服务未配置" }, { status: 503 })
  }

  try {
    const { image } = await request.json()
    if (!image) return NextResponse.json({ error: "未提供图片" }, { status: 400 })

    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        max_tokens: 512,
        messages: [
          {
            role: "system",
            content: `你是一个专业的营养师。根据食物照片分析营养信息，只返回JSON：
{"name":"食物名称","weight":克数,"calories":千卡,"protein":克,"fat":克,"carbs":克,"confidence":"high/medium/low"}
无法识别时返回：{"error":"无法识别食物"}`,
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
      console.error("DeepSeek API error:", data)
      return NextResponse.json({ error: "AI 服务异常，请重试" }, { status: 500 })
    }

    const text = data.choices?.[0]?.message?.content || ""
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("AI 返回格式异常")

    const result = JSON.parse(jsonMatch[0])
    return NextResponse.json(result)
  } catch (err: any) {
    console.error("Food analysis error:", err)
    return NextResponse.json(
      { error: err.message || "分析失败，请重试" },
      { status: 500 }
    )
  }
}
