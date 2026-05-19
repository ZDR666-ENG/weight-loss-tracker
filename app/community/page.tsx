"use client"

import { useEffect, useState } from "react"

interface Post {
  id: string
  content: string
  createdAt: string
  user: { id: string; name: string }
  comments: { id: string; content: string; createdAt: string; user: { id: string; name: string } }[]
  likes: { userId: string }[]
  _count: { comments: number; likes: number }
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [content, setContent] = useState("")
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [commentText, setCommentText] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setCurrentUser(d.user))
    loadPosts()
  }, [])

  async function loadPosts() {
    const res = await fetch("/api/posts")
    const data = await res.json()
    setPosts(data.posts || [])
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    })
    setContent("")
    setLoading(false)
    loadPosts()
  }

  async function handleLike(postId: string) {
    await fetch(`/api/posts/${postId}/like`, { method: "POST" })
    loadPosts()
  }

  async function handleComment(postId: string) {
    const text = commentText[postId]
    if (!text?.trim()) return
    await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    })
    setCommentText({ ...commentText, [postId]: "" })
    loadPosts()
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-800">👥 社区</h2>

      {/* New Post */}
      <form onSubmit={handlePost} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="分享你的减肥进展、心情或经验..."
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 resize-none"
          rows={3}
        />
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="bg-purple-500 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-purple-600 disabled:opacity-50 transition"
        >
          发布动态
        </button>
      </form>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post) => {
          const liked = post.likes.some((l) => l.userId === currentUser?.id)
          return (
            <div key={post.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-800 text-sm">{post.user.name}</span>
                <span className="text-xs text-gray-400">
                  {new Date(post.createdAt).toLocaleDateString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{post.content}</p>
              <div className="flex items-center gap-4 pt-2 border-t border-gray-50">
                <button onClick={() => handleLike(post.id)}
                  className={`text-xs font-medium flex items-center gap-1 ${liked ? "text-red-500" : "text-gray-400 hover:text-red-400"}`}>
                  {liked ? "❤️" : "🤍"} {post._count.likes}
                </button>
                <span className="text-xs text-gray-400">💬 {post._count.comments}</span>
              </div>

              {/* Comments */}
              {post.comments.length > 0 && (
                <div className="space-y-2 pt-2">
                  {post.comments.map((c) => (
                    <div key={c.id} className="bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-xs font-semibold text-gray-700">{c.user.name}</span>
                      <span className="text-xs text-gray-400 ml-2">
                        {new Date(c.createdAt).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
                      </span>
                      <p className="text-sm text-gray-600 mt-0.5">{c.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={commentText[post.id] || ""}
                  onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                  placeholder="写评论..."
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-purple-400"
                  onKeyDown={(e) => { if (e.key === "Enter") handleComment(post.id) }}
                />
                <button onClick={() => handleComment(post.id)}
                  className="text-xs text-purple-600 font-medium hover:text-purple-700">
                  发送
                </button>
              </div>
            </div>
          )
        })}
        {posts.length === 0 && (
          <p className="text-center text-gray-400 py-12">还没有人发帖，来发布第一条动态吧！</p>
        )}
      </div>
    </div>
  )
}
