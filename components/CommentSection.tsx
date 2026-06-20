"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Comment = {
  id: string;
  body: string;
  createdAt: string;
  user: { name: string };
};

type Props = { promptId: string; initialComments: Comment[] };

export default function CommentSection({ promptId, initialComments }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) { router.push("/login"); return; }
    if (!body.trim()) return;

    setLoading(true);
    setError("");

    const res = await fetch(`/api/prompts/${promptId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "エラーが発生しました");
      return;
    }

    const newComment = await res.json();
    setComments((prev) => [...prev, newComment]);
    setBody("");
  }

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-900 mb-4">
        コメント <span className="text-gray-400 font-normal">({comments.length})</span>
      </h2>

      {comments.length === 0 && (
        <p className="text-sm text-gray-400 mb-4">まだコメントがありません</p>
      )}

      <div className="space-y-3 mb-6">
        {comments.map((c) => (
          <div key={c.id} className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-gray-700">{c.user.name}</span>
              <span className="text-xs text-gray-400">
                {new Date(c.createdAt).toLocaleDateString("ja-JP")}
              </span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.body}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        {error && <p className="text-xs text-red-600">{error}</p>}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={session ? "コメントを入力..." : "コメントするにはログインしてください"}
          disabled={!session}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:bg-gray-50 disabled:text-gray-400"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !body.trim() || !session}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors"
          >
            {loading ? "送信中..." : "コメントする"}
          </button>
        </div>
      </form>
    </div>
  );
}
