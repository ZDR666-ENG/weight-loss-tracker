export const dynamic = "force-dynamic"

export async function GET() {
  // Step 1: dynamic import
  let prisma: any
  try {
    const mod = await import("@/lib/prisma")
    prisma = mod.prisma
  } catch (e: unknown) {
    const err = e as Error
    return Response.json({ step: "import", error: err.message })
  }

  // Step 2: raw query
  try {
    const result = await prisma.$queryRaw`SELECT 1 as test`
    return Response.json({ ok: true, step: "rawQuery", result })
  } catch (e: unknown) {
    const err = e as Error
    return Response.json({ step: "rawQuery", error: err.message })
  }
}
