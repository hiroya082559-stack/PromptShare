import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const sort = searchParams.get("sort") ?? "new";
  const category = searchParams.get("category") ?? "";
  const tag = searchParams.get("tag") ?? "";

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

  return Response.json(prompts);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { title, content, category, tags } = await request.json();
  if (!title || !content || !category) {
    return Response.json({ error: "title, content, category は必須です" }, { status: 400 });
  }

  const tagsJson = JSON.stringify(
    (tags as string)
      .split(/[,\s　]+/)
      .map((t: string) => t.replace(/^#/, "").trim())
      .filter(Boolean)
  );

  const prompt = await prisma.prompt.create({
    data: {
      title,
      content,
      category,
      tags: tagsJson,
      authorId: session.user.id,
    },
  });

  return Response.json(prompt, { status: 201 });
}
