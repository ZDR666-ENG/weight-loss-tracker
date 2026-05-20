"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<{ name: string } | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.user) setUser(d.user) })
      .catch(() => {})
  }, [pathname])

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
    router.refresh()
  }

  const links = [
    { href: "/dashboard", label: "仪表盘" },
    { href: "/weight", label: "体重" },
    { href: "/diet", label: "饮食" },
    { href: "/exercise", label: "运动" },
    { href: "/exercise-plan", label: "计划" },
    { href: "/calculator", label: "计算器" },
    { href: "/community", label: "社区" },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href={user ? "/dashboard" : "/"} className="text-lg font-bold text-emerald-600 shrink-0">
          💪 减肥追踪
        </Link>

        {user ? (
          <>
            <div className="hidden md:flex items-center gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    pathname.startsWith(l.href)
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/profile" className="text-sm text-gray-600 hover:text-emerald-600">
                {user.name}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-red-500 transition"
              >
                退出
              </button>
            </div>

            <button
              className="md:hidden text-gray-600"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-gray-600 hover:text-emerald-600">
              登录
            </Link>
            <Link
              href="/auth/register"
              className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-emerald-600 transition"
            >
              注册
            </Link>
          </div>
        )}
      </div>

      {user && menuOpen && (
        <div className="md:hidden border-t border-gray-100 px-4 py-2 space-y-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm font-medium ${
                pathname.startsWith(l.href)
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/profile"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600"
          >
            个人资料
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-500"
          >
            退出登录
          </button>
        </div>
      )}
    </nav>
  )
}
