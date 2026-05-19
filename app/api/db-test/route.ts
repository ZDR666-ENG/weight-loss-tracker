export const dynamic = "force-dynamic"

export async function GET() {
  const results: string[] = []

  // Step 1: just import
  try {
    const { prisma } = await import("@/lib/prisma")
    results.push("Step 1: import ok")
  } catch (e: unknown) {
    const err = e as Error
    return Response.json({ step: "import", error: err.message, stack: err.stack?.split("\n").slice(0, 10) })
  }

  // Step 2: try raw query
  try {
    const result = await (prisma as any).$queryRaw`SELECT 1 as test`
    results.push("Step 2: raw query ok: " + JSON.stringify(result))
  } catch (e: unknown) {
    const err = e as Error
    return Response.json({ step: "rawQuery", error: err.message, results })
  }

  return Response.json({ ok: true, results })
}
