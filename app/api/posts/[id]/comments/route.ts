import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSession()
  if (!userId) return Response.json({ error: "未登录" }, { status: 401 })

  const { id } = await params
  const { content } = await request.json()

  if (!content || !content.trim()) {
    return Response.json({ error: "请输入评论内容" }, { status: 400 })
  }

  const comment = await prisma.comment.create({
    data: { postId: id, userId, content: content.trim() },
    include: { user: { select: { id: true, name: true } } },
  })

  return Response.json({ comment })
}
