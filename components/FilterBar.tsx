"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

const CATEGORIES = ["すべて", "ChatGPT", "Claude", "Gemini", "画像生成", "コーディング", "その他"];

export default function FilterBar() {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const sort = params.get("sort") ?? "new";
  const category = params.get("category") ?? "";
  const [tagInput, setTagInput] = useState(params.get("tag") ?? "");

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    startTransition(() => router.push(`/?${next.toString()}`));
  }

  function handleTagSearch(e: React.FormEvent) {
    e.preventDefault();
    update("tag", tagInput.trim());
  }

  return (
    <div className="space-y-3">
      {/* Sort tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { value: "new", label: "新着" },
          { value: "ranking", label: "人気順" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => update("sort", tab.value === "new" ? "" : tab.value)}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
              sort === tab.value
                ? "bg-white text-indigo-600 font-medium shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const val = cat === "すべて" ? "" : cat;
          return (
            <button
              key={cat}
              onClick={() => update("category", val)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                category === val
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "border-gray-300 text-gray-600 hover:border-indigo-400 hover:text-indigo-600"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Tag search */}
      <form onSubmit={handleTagSearch} className="flex gap-2">
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          placeholder="タグで検索..."
          className="text-sm border border-gray-300 rounded-md px-3 py-1.5 w-48 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <button
          type="submit"
          className="text-sm bg-gray-100 text-gray-600 px-3 py-1.5 rounded-md hover:bg-gray-200 transition-colors"
        >
          検索
        </button>
        {params.get("tag") && (
          <button
            type="button"
            onClick={() => { setTagInput(""); update("tag", ""); }}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </form>

      {isPending && <p className="text-xs text-gray-400">読み込み中...</p>}
    </div>
  );
}
