import { prisma } from "@/lib/prisma"
import { verifyPassword, createToken, setSessionCookie } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return Response.json({ error: "请输入邮箱和密码" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return Response.json({ error: "邮箱或密码错误" }, { status: 401 })
    }

    const valid = await verifyPassword(password, user.password)
    if (!valid) {
      return Response.json({ error: "邮箱或密码错误" }, { status: 401 })
    }

    const token = await createToken(user.id)
    await setSessionCookie(token)

    return Response.json({ user: { id: user.id, name: user.name, email: user.email } })
  } catch {
    return Response.json({ error: "登录失败，请稍后重试" }, { status: 500 })
  }
}
