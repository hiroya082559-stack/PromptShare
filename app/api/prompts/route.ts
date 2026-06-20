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
