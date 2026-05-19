import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            💪 一起科学减肥
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
            记录体重变化、管理每日饮食、计算身体指标，在社区中找到同伴一起进步
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-emerald-500 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-emerald-600 transition shadow-lg shadow-emerald-200"
            >
              免费开始
            </Link>
            <Link
              href="/auth/login"
              className="bg-white text-emerald-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-50 transition border border-emerald-200"
            >
              登录
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-12">核心功能</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="text-3xl mb-3">⚖️</div>
            <h3 className="font-bold text-gray-800 mb-2">体重追踪</h3>
            <p className="text-sm text-gray-500">每日记录体重，可视化趋势图帮你了解变化</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="text-3xl mb-3">🍽️</div>
            <h3 className="font-bold text-gray-800 mb-2">饮食管理</h3>
            <p className="text-sm text-gray-500">记录每餐卡路里和营养摄入，控制饮食更科学</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="text-3xl mb-3">📐</div>
            <h3 className="font-bold text-gray-800 mb-2">BMI/BMR 计算</h3>
            <p className="text-sm text-gray-500">了解自己的身体指标，设定合理的减重目标</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="text-3xl mb-3">👥</div>
            <h3 className="font-bold text-gray-800 mb-2">社区激励</h3>
            <p className="text-sm text-gray-500">与同伴分享进展，互相鼓励，减肥路上不孤单</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-emerald-500 py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">准备好开始你的减肥之旅了吗？</h2>
        <p className="text-emerald-100 mb-8">免费注册，立即开始记录</p>
        <Link
          href="/auth/register"
          className="inline-block bg-white text-emerald-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-50 transition"
        >
          立即注册
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-400 border-t border-gray-100">
        减肥追踪 &copy; {new Date().getFullYear()} — 健康生活每一天
      </footer>
    </div>
  )
}
