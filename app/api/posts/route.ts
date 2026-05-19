import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const userId = await getSession()
  if (!userId) return Response.json({ error: "未登录" }, { status: 401 })

  const posts = await prisma.post.findMany({
    include: {
      user: { select: { id: true, name: true } },
      comments: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
      likes: { select: { userId: true } },
      _count: { select: { comments: true, likes: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return Response.json({ posts })
}

export async function POST(request: Request) {
  const userId = await getSession()
  if (!userId) return Response.json({ error: "未登录" }, { status: 401 })

  const { content } = await request.json()

  if (!content || !content.trim()) {
    return Response.json({ error: "请输入内容" }, { status: 400 })
  }

  const post = await prisma.post.create({
    data: { userId, content: content.trim() },
    include: {
      user: { select: { id: true, name: true } },
      comments: { include: { user: { select: { id: true, name: true } } } },
      likes: { select: { userId: true } },
      _count: { select: { comments: true, likes: true } },
    },
  })

  return Response.json({ post })
}
