import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  ctx: RouteContext<"/api/prompts/[id]/copy">
) {
  const { id } = await ctx.params;

  const prompt = await prisma.prompt.update({
    where: { id },
    data: { copyCount: { increment: 1 } },
    select: { copyCount: true },
  });

  return Response.json(prompt);
}
