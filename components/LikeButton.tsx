"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Props = { promptId: string; initialCount: number; initialLiked: boolean };

export default function LikeButton({ promptId, initialCount, initialLiked }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function handleLike() {
    if (!session) {
      router.push("/login");
      return;
    }
    if (loading) return;
    setLoading(true);

    const optimisticLiked = !liked;
    setLiked(optimisticLiked);
    setCount((c) => (optimisticLiked ? c + 1 : c - 1));

    const res = await fetch(`/api/prompts/${promptId}/like`, { method: "POST" });
    if (!res.ok) {
      setLiked(liked);
      setCount(count);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
        liked
          ? "bg-red-50 text-red-600 border-red-300 hover:bg-red-100"
          : "bg-white text-gray-600 border-gray-300 hover:border-red-300 hover:text-red-500"
      }`}
    >
      <svg
        className="w-4 h-4"
        fill={liked ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      {count}
    </button>
  );
}
