import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import PromptCard from "@/components/PromptCard";
import FilterBar from "@/components/FilterBar";

type SearchParams = Promise<{ sort?: string; category?: string; tag?: string }>;

async function PromptList({ searchParams }: { searchParams: SearchParams }) {
  const { sort = "new", category = "", tag = "" } = await searchParams;

  const prompts = await prisma.prompt.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(tag ? { tags: { contains: tag } } : {}),
    },
    include: {
      author: { select: { id: true, name: true } },
      _count: { select: { likes: true, comments: true } },
    },
    orderBy:
      sort === "ranking"
        ? { likes: { _count: "desc" } }
        : { createdAt: "desc" },
    take: 50,
  });

  if (prompts.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">📭</p>
        <p>プロンプトがまだありません</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {prompts.map((prompt) => (
        <PromptCard key={prompt.id} prompt={prompt} />
      ))}
    </div>
  );
}

export default function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">AIプロンプトを探す</h1>
        <p className="text-gray-500 text-sm">みんなが使っている便利なプロンプトを発見・共有しよう</p>
      </div>

      <div className="mb-6">
        <Suspense>
          <FilterBar />
        </Suspense>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 h-36 animate-pulse" />
            ))}
          </div>
        }
      >
        <PromptList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
