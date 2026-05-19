import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const userId = await getSession()
  if (!userId) {
    return Response.json({ error: "未登录" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, height: true, weight: true, age: true, gender: true, goalWeight: true },
  })

  if (!user) {
    return Response.json({ error: "用户不存在" }, { status: 404 })
  }

  return Response.json({ user })
}
