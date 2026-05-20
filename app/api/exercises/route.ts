import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { calcCalories } from "@/lib/exercise"

export async function GET(request: Request) {
  const userId = await getSession()
  if (!userId) return Response.json({ error: "未登录" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const date = searchParams.get("date")

  const where: any = { userId }
  if (date) {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)
    where.date = { gte: start, lte: end }
  }

  const logs = await prisma.exerciseLog.findMany({
    where,
    orderBy: { date: "desc" },
  })

  return Response.json({ logs })
}

export async function POST(request: Request) {
  const userId = await getSession()
  if (!userId) return Response.json({ error: "未登录" }, { status: 401 })

  try {
    const { type, duration, date, note } = await request.json()

    if (!type || !duration) {
      return Response.json({ error: "请选择运动类型和时长" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    const weight = user?.weight || 70
    const calories = calcCalories(type, duration, weight)

    const log = await prisma.exerciseLog.create({
      data: {
        userId,
        type,
        duration,
        calories,
        date: date ? new Date(date) : new Date(),
        note: note || null,
      },
    })

    return Response.json({ log })
  } catch {
    return Response.json({ error: "添加失败" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const userId = await getSession()
  if (!userId) return Response.json({ error: "未登录" }, { status: 401 })

  try {
    const { id } = await request.json()
    const log = await prisma.exerciseLog.findUnique({ where: { id } })
    if (!log || log.userId !== userId) {
      return Response.json({ error: "记录不存在" }, { status: 404 })
    }
    await prisma.exerciseLog.delete({ where: { id } })
    return Response.json({ success: true })
  } catch {
    return Response.json({ error: "删除失败" }, { status: 500 })
  }
}
