import Link from "next/link";

type Props = {
  prompt: {
    id: string;
    title: string;
    content: string;
    category: string;
    tags: string;
    copyCount: number;
    createdAt: Date | string;
    author: { name: string };
    _count: { likes: number; comments: number };
  };
};

export default function PromptCard({ prompt }: Props) {
  const tags: string[] = JSON.parse(prompt.tags || "[]");
  const preview = prompt.content.slice(0, 120) + (prompt.content.length > 120 ? "…" : "");

  return (
    <Link href={`/prompts/${prompt.id}`} className="block">
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h2 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
            {prompt.title}
          </h2>
          <span className="shrink-0 text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
            {prompt.category}
          </span>
        </div>
        <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-2">
          {preview}
        </p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{prompt.author.name}</span>
          <div className="flex items-center gap-3">
            <span>❤ {prompt._count.likes}</span>
            <span>💬 {prompt._count.comments}</span>
            <span>📋 {prompt.copyCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
