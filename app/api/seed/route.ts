import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const SECRET = "promptshare-seed-2026";

export async function POST(req: NextRequest) {
  const { secret } = await req.json();
  if (secret !== SECRET) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const hashed = await bcrypt.hash("password123", 10);

  const user1 = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: { name: "Alice", email: "alice@example.com", password: hashed },
  });
  const user2 = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: { name: "Bob", email: "bob@example.com", password: hashed },
  });

  const promptsData = [
    {
      title: "論文・技術記事の要約プロンプト",
      content: `以下の文章を読んで、次の形式で要約してください。

【要約】
3〜5文で核心をまとめる

【キーポイント】
・重要な点を箇条書きで3〜5個

【感想・考察】
この内容についてあなたの意見を1〜2文で

---
{ここに文章を貼り付け}`,
      category: "ChatGPT",
      tags: JSON.stringify(["要約", "論文", "記事"]),
      authorId: user1.id,
      copyCount: 42,
    },
    {
      title: "コードレビューをしてもらうプロンプト",
      content: `あなたは経験豊富なシニアエンジニアです。以下のコードをレビューして、改善点を教えてください。

レビューの観点：
1. バグや潜在的な問題
2. パフォーマンス
3. 可読性・保守性
4. セキュリティ
5. ベストプラクティスへの準拠

コード:
\`\`\`
{ここにコードを貼り付け}
\`\`\`

具体的な修正例も合わせて提示してください。`,
      category: "コーディング",
      tags: JSON.stringify(["コードレビュー", "開発", "品質向上"]),
      authorId: user1.id,
      copyCount: 88,
    },
    {
      title: "ブログ記事の構成を考えてもらうプロンプト",
      content: `以下のテーマでブログ記事の構成を提案してください。

テーマ: {テーマを入力}
ターゲット読者: {読者層を入力}
文字数目安: {文字数}

出力形式:
- タイトル案（3つ）
- 導入文のポイント
- 見出し構成（H2・H3）
- 各セクションで触れるべきポイント
- まとめのポイント`,
      category: "ChatGPT",
      tags: JSON.stringify(["ブログ", "ライティング", "構成"]),
      authorId: user2.id,
      copyCount: 31,
    },
    {
      title: "英語メールを丁寧に翻訳するプロンプト",
      content: `以下の日本語メールを、ビジネス英語として自然で丁寧な英文に翻訳してください。

条件:
- フォーマルなビジネスメールのトーンを維持する
- 日本語特有の曖昧な表現は、英語圏で自然な表現に意訳する
- 敬語や謙譲語は適切な英語表現に変換する

日本語メール:
{ここにメール本文を貼り付け}`,
      category: "Claude",
      tags: JSON.stringify(["英語", "翻訳", "ビジネスメール"]),
      authorId: user2.id,
      copyCount: 57,
    },
    {
      title: "アイデアブレインストーミング支援プロンプト",
      content: `以下のテーマについて、ブレインストーミングを手伝ってください。

テーマ: {テーマ}

以下の手順で進めてください：
1. まず関連するキーワードを20個挙げる
2. そのキーワードを組み合わせて斬新なアイデアを10個考える
3. 各アイデアの実現可能性と独自性を★5段階で評価する
4. 上位3つのアイデアを詳しく説明する`,
      category: "Claude",
      tags: JSON.stringify(["ブレスト", "アイデア出し", "企画"]),
      authorId: user1.id,
      copyCount: 23,
    },
    {
      title: "画像生成用・リアルな風景写真プロンプト",
      content: `A breathtaking landscape photograph of {場所・情景}, shot with a professional DSLR camera, golden hour lighting, dramatic clouds, ultra-realistic, 8K resolution, National Geographic style, depth of field, vivid colors, f/2.8 aperture, sharp focus on foreground`,
      category: "画像生成",
      tags: JSON.stringify(["風景", "写真風", "リアル"]),
      authorId: user2.id,
      copyCount: 104,
    },
    {
      title: "会議の議事録を自動作成するプロンプト",
      content: `以下の会議メモをもとに、正式な議事録を作成してください。

【出力形式】
# 議事録
- 日時：
- 参加者：
- 場所/形式：

## 議題
## 決定事項
## 議論内容（要点）
## 次のアクション（担当者・期限付き）
## 次回予定

---
会議メモ:
{ここに会議メモを貼り付け}`,
      category: "ChatGPT",
      tags: JSON.stringify(["議事録", "会議", "ビジネス文書"]),
      authorId: user1.id,
      copyCount: 76,
    },
    {
      title: "Pythonコードのバグを修正するプロンプト",
      content: `以下のPythonコードにバグがあります。デバッグして修正してください。

エラーメッセージ:
\`\`\`
{エラーメッセージを貼り付け}
\`\`\`

コード:
\`\`\`python
{コードを貼り付け}
\`\`\`

次の点を教えてください：
1. バグの原因
2. 修正後のコード
3. 同様のバグを防ぐためのアドバイス`,
      category: "コーディング",
      tags: JSON.stringify(["Python", "デバッグ", "バグ修正"]),
      authorId: user2.id,
      copyCount: 65,
    },
    {
      title: "ポートレート写真風・アニメキャラクタープロンプト",
      content: `Anime style portrait of {キャラクターの特徴}, soft lighting, detailed eyes, flowing hair, studio background, high quality illustration, trending on ArtStation, vibrant colors, sharp details, professional digital art, 4K`,
      category: "画像生成",
      tags: JSON.stringify(["アニメ", "ポートレート", "キャラクター"]),
      authorId: user1.id,
      copyCount: 89,
    },
    {
      title: "Geminiで数学の問題をステップ解説させるプロンプト",
      content: `以下の数学の問題を解いてください。必ず次の形式で答えてください。

【問題の確認】
問題を自分の言葉で言い換える

【解法の方針】
どのアプローチで解くかを説明

【ステップごとの解説】
Step 1: 〜
Step 2: 〜
（途中計算を省略せず全て書く）

【答え】
最終的な答え

【検算】
答えが正しいか別の方法で確認

問題: {ここに問題を入力}`,
      category: "Gemini",
      tags: JSON.stringify(["数学", "勉強", "解説"]),
      authorId: user2.id,
      copyCount: 38,
    },
  ];

  for (const p of promptsData) {
    await prisma.prompt.create({ data: p });
  }

  const allPrompts = await prisma.prompt.findMany({ take: 5 });
  for (const p of allPrompts) {
    for (const userId of [user1.id, user2.id]) {
      await prisma.like.upsert({
        where: { userId_promptId: { userId, promptId: p.id } },
        create: { userId, promptId: p.id },
        update: {},
      });
    }
  }

  return Response.json({
    ok: true,
    users: 2,
    prompts: promptsData.length,
  });
}
