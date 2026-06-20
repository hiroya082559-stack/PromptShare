import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  ctx: RouteContext<"/api/prompts/[id]/like">
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const userId = session.user.id;

  const existing = await prisma.like.findUnique({
    where: { userId_promptId: { userId, promptId: id } },
  });

  if (existing) {
    await prisma.like.delete({
      where: { userId_promptId: { userId, promptId: id } },
    });
    return Response.json({ liked: false });
  } else {
    await prisma.like.create({ data: { userId, promptId: id } });
    return Response.json({ liked: true });
  }
}
