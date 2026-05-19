import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const userCount = await prisma.user.count()
    return Response.json({ ok: true, userCount })
  } catch (e: unknown) {
    const err = e as Error
    return Response.json({ ok: false, error: err.message, stack: err.stack, name: err.name }, { status: 500 })
  }
}
