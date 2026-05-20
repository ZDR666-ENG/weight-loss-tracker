import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET() {
  const userId = await getSession()
  if (!userId) return Response.json({ error: "未登录" }, { status: 401 })

  const plans = await prisma.exercisePlan.findMany({
    where: { userId },
    orderBy: { dayOfWeek: "asc" },
  })

  return Response.json({ plans })
}

export async function PUT(request: Request) {
  const userId = await getSession()
  if (!userId) return Response.json({ error: "未登录" }, { status: 401 })

  try {
    const { dayOfWeek, type, duration, calories, note } = await request.json()

    if (dayOfWeek === undefined || !type || !duration) {
      return Response.json({ error: "缺少必要字段" }, { status: 400 })
    }

    // Upsert: update if exists, create if not
    const existing = await prisma.exercisePlan.findFirst({
      where: { userId, dayOfWeek },
    })

    let plan
    if (existing) {
      plan = await prisma.exercisePlan.update({
        where: { id: existing.id },
        data: { type, duration, calories, note },
      })
    } else {
      plan = await prisma.exercisePlan.create({
        data: { userId, dayOfWeek, type, duration, calories, note },
      })
    }

    return Response.json({ plan })
  } catch {
    return Response.json({ error: "保存失败" }, { status: 500 })
  }
}
