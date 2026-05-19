import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const userId = await getSession()
  if (!userId) return Response.json({ error: "未登录" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0]

  const startOfDay = new Date(date + "T00:00:00")
  const endOfDay = new Date(date + "T23:59:59")

  const meals = await prisma.meal.findMany({
    where: {
      userId,
      date: { gte: startOfDay, lte: endOfDay },
    },
    orderBy: { date: "desc" },
  })

  return Response.json({ meals })
}

export async function POST(request: Request) {
  const userId = await getSession()
  if (!userId) return Response.json({ error: "未登录" }, { status: 401 })

  const { name, calories, protein, carbs, fat, mealType, date } = await request.json()

  if (!name || !calories) {
    return Response.json({ error: "请填写食物名称和卡路里" }, { status: 400 })
  }

  const meal = await prisma.meal.create({
    data: {
      userId,
      name,
      calories: parseFloat(calories),
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
      mealType: mealType || "other",
      date: date ? new Date(date) : new Date(),
    },
  })

  return Response.json({ meal })
}

export async function DELETE(request: Request) {
  const userId = await getSession()
  if (!userId) return Response.json({ error: "未登录" }, { status: 401 })

  const { id } = await request.json()
  await prisma.meal.deleteMany({ where: { id, userId } })

  return Response.json({ success: true })
}
