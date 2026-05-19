import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(request: Request) {
  const userId = await getSession()
  if (!userId) return Response.json({ error: "未登录" }, { status: 401 })

  const { name, height, weight, age, gender, goalWeight } = await request.json()

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name && { name }),
      ...(height !== undefined && { height: parseFloat(height) }),
      ...(weight !== undefined && { weight: parseFloat(weight) }),
      ...(age !== undefined && { age: parseInt(age) }),
      ...(gender !== undefined && { gender }),
      ...(goalWeight !== undefined && { goalWeight: parseFloat(goalWeight) }),
    },
    select: { id: true, name: true, email: true, height: true, weight: true, age: true, gender: true, goalWeight: true },
  })

  return Response.json({ user })
}
