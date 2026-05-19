import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const userId = await getSession()
  if (!userId) return Response.json({ error: "未登录" }, { status: 401 })

  const logs = await prisma.weightLog.findMany({
    where: { userId },
    orderBy: { recordedAt: "desc" },
    take: 90,
  })

  return Response.json({ logs })
}

export async function POST(request: Request) {
  const userId = await getSession()
  if (!userId) return Response.json({ error: "未登录" }, { status: 401 })

  const { weight, note, recordedAt } = await request.json()

  if (!weight || weight <= 0) {
    return Response.json({ error: "请输入有效体重" }, { status: 400 })
  }

  const log = await prisma.weightLog.create({
    data: {
      userId,
      weight: parseFloat(weight),
      note: note || "",
      recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
    },
  })

  // Update user's current weight
  await prisma.user.update({
    where: { id: userId },
    data: { weight: parseFloat(weight) },
  })

  return Response.json({ log })
}

export async function DELETE(request: Request) {
  const userId = await getSession()
  if (!userId) return Response.json({ error: "未登录" }, { status: 401 })

  const { id } = await request.json()
  await prisma.weightLog.deleteMany({ where: { id, userId } })

  return Response.json({ success: true })
}
