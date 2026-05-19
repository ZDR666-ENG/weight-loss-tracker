import { prisma } from "@/lib/prisma"
import { hashPassword, createToken, setSessionCookie } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return Response.json({ error: "请填写所有必填字段" }, { status: 400 })
    }

    if (password.length < 6) {
      return Response.json({ error: "密码至少6位" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return Response.json({ error: "该邮箱已注册" }, { status: 400 })
    }

    const hashed = await hashPassword(password)
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    })

    const token = await createToken(user.id)
    await setSessionCookie(token)

    return Response.json({ user: { id: user.id, name: user.name, email: user.email } })
  } catch (e: unknown) {
    const err = e as Error
    return Response.json({ error: err.message || "注册失败，请稍后重试" }, { status: 500 })
  }
}
