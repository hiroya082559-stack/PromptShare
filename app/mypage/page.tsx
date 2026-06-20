import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PromptCard from "@/components/PromptCard";

export default async function MyPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const prompts = await prisma.prompt.findMany({
    where: { authorId: session.user.id },
    include: {
      author: { select: { id: true, name: true } },
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">マイページ</h1>
          <p className="text-gray-500 text-sm mt-1">{session.user.name} さんの投稿</p>
        </div>
        <Link
          href="/prompts/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          新しく投稿する
        </Link>
      </div>

      {prompts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📝</p>
          <p className="mb-4">まだ投稿がありません</p>
          <Link
            href="/prompts/new"
            className="text-indigo-600 hover:underline text-sm"
          >
            最初のプロンプトを投稿する →
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-400 mb-4">{prompts.length} 件の投稿</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {prompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
