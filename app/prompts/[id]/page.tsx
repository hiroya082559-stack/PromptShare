import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CopyButton from "@/components/CopyButton";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";

export default async function PromptDetailPage(
  props: PageProps<"/prompts/[id]">
) {
  const { id } = await props.params;
  const session = await getServerSession(authOptions);

  const prompt = await prisma.prompt.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true } },
      _count: { select: { likes: true, comments: true } },
      comments: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!prompt) notFound();

  const tags: string[] = JSON.parse(prompt.tags || "[]");

  const liked = session
    ? !!(await prisma.like.findUnique({
        where: {
          userId_promptId: { userId: session.user.id, promptId: id },
        },
      }))
    : false;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* パンくず */}
      <nav className="text-xs text-gray-400 mb-6">
        <Link href="/" className="hover:text-indigo-600">トップ</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-600">{prompt.title}</span>
      </nav>

      {/* ヘッダー */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
            {prompt.category}
          </span>
          {tags.map((tag) => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
              #{tag}
            </span>
          ))}
        </div>
        <h1 className="text-xl font-bold text-gray-900 leading-snug mb-3">
          {prompt.title}
        </h1>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>投稿者: <span className="text-gray-600 font-medium">{prompt.author.name}</span></span>
          <span>{new Date(prompt.createdAt).toLocaleDateString("ja-JP")}</span>
          <span>📋 {prompt.copyCount} コピー</span>
        </div>
      </div>

      {/* プロンプト本文 */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-4">
        <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
          {prompt.content}
        </pre>
      </div>

      {/* アクションボタン */}
      <div className="flex items-center gap-3 mb-10">
        <CopyButton promptId={prompt.id} content={prompt.content} />
        <LikeButton
          promptId={prompt.id}
          initialCount={prompt._count.likes}
          initialLiked={liked}
        />
      </div>

      {/* 区切り線 */}
      <hr className="border-gray-200 mb-8" />

      {/* コメントセクション */}
      <CommentSection
        promptId={prompt.id}
        initialComments={prompt.comments.map((c) => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
