import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/prompts/[id]/comments">
) {
  const { id } = await ctx.params;

  const comments = await prisma.comment.findMany({
    where: { promptId: id },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });

  return Response.json(comments);
}

export async function POST(
  req: Request,
  ctx: RouteContext<"/api/prompts/[id]/comments">
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const { body } = await req.json();

  if (!body?.trim()) {
    return Response.json({ error: "コメントを入力してください" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: { body: body.trim(), userId: session.user.id, promptId: id },
    include: { user: { select: { name: true } } },
  });

  return Response.json(comment, { status: 201 });
}
