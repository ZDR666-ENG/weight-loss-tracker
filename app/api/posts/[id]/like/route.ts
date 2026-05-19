import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSession()
  if (!userId) return Response.json({ error: "未登录" }, { status: 401 })

  const { id } = await params

  const existing = await prisma.like.findUnique({
    where: { postId_userId: { postId: id, userId } },
  })

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } })
    return Response.json({ liked: false })
  } else {
    await prisma.like.create({ data: { postId: id, userId } })
    return Response.json({ liked: true })
  }
}
