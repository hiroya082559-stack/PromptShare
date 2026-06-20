import * as XLSX from "xlsx";

const wb = XLSX.utils.book_new();

// Sheet 1: 要件定義書
const req = [
  ["PromptShare 要件定義書"],
  [],
  ["■ サービス概要"],
  ["項目", "内容"],
  ["サービス名", "PromptShare"],
  ["概要", "AIプロンプトを投稿・共有・発見できるコミュニティプラットフォーム"],
  ["目的", "ユーザーが便利なAIプロンプトを共有し他ユーザーが活用できる場を提供する"],
  ["対象ユーザー", "AIツール（ChatGPT・Claude・Gemini等）を日常的に使うユーザー"],
  [],
  ["■ 機能要件"],
  ["機能カテゴリ", "機能名", "説明", "ログイン必須"],
  ["認証", "ユーザー登録", "名前・メール・パスワードでアカウント作成", "不要"],
  ["認証", "ログイン", "メール・パスワードでログイン（JWT）", "不要"],
  ["認証", "ログアウト", "セッションを破棄してトップへ遷移", "必要"],
  ["プロンプト", "一覧表示", "プロンプトをカード形式で一覧表示", "不要"],
  ["プロンプト", "新着順表示", "投稿日時の降順で表示", "不要"],
  ["プロンプト", "人気順表示", "いいね数の降順で表示", "不要"],
  ["プロンプト", "カテゴリフィルター", "カテゴリで絞り込み", "不要"],
  ["プロンプト", "タグ検索", "タグキーワードで絞り込み", "不要"],
  ["プロンプト", "詳細表示", "タイトル・本文・著者・タグ・統計を表示", "不要"],
  ["プロンプト", "コピー", "本文をクリップボードにコピー・コピー数を記録", "不要"],
  ["プロンプト", "投稿", "タイトル・本文・カテゴリ・タグを入力して投稿", "必要"],
  ["インタラクション", "いいね", "プロンプトへのいいね（トグル）", "必要"],
  ["インタラクション", "コメント", "プロンプトへのコメント投稿・閲覧", "投稿は必要"],
  ["マイページ", "自分の投稿一覧", "自分が投稿したプロンプトを一覧表示", "必要"],
  [],
  ["■ 非機能要件"],
  ["項目", "内容"],
  ["ホスティング", "Vercel（サーバーレス）"],
  ["データベース", "Neon（PostgreSQL・クラウド）"],
  ["認証方式", "JWT（NextAuth.js）"],
  ["レスポンシブ", "PC・スマートフォン対応"],
  ["セキュリティ", "パスワードはbcryptでハッシュ化・環境変数で機密情報管理"],
  ["コスト", "全サービス無料枠内で運用"],
];
const ws1 = XLSX.utils.aoa_to_sheet(req);
ws1["!cols"] = [{ wch: 18 }, { wch: 30 }, { wch: 46 }, { wch: 14 }];
XLSX.utils.book_append_sheet(wb, ws1, "要件定義書");

// Sheet 2: 画面設計書
const pages = [
  ["PromptShare 画面設計書"],
  [],
  ["画面名", "URL", "認証", "説明", "主なコンポーネント"],
  ["トップページ", "/", "不要", "プロンプト一覧。新着/人気タブ・カテゴリ・タグで絞り込み可能", "FilterBar, PromptCard"],
  ["プロンプト詳細", "/prompts/[id]", "不要（いいね・コメントは必要）", "本文全文・コピーボタン・いいね・コメント一覧", "CopyButton, LikeButton, CommentSection"],
  ["プロンプト投稿", "/prompts/new", "必要", "タイトル・本文・カテゴリ・タグを入力して投稿", "投稿フォーム"],
  ["ログイン", "/login", "不要", "メール・パスワードでログイン", "ログインフォーム"],
  ["新規登録", "/register", "不要", "名前・メール・パスワードでアカウント作成", "登録フォーム"],
  ["マイページ", "/mypage", "必要", "自分の投稿プロンプト一覧", "PromptCard"],
  [],
  ["■ 共通レイアウト"],
  ["要素", "内容"],
  ["ナビゲーションバー", "ロゴ・投稿ボタン・ログイン/ログアウト・マイページ"],
  ["背景色", "gray-50（薄いグレー）"],
  ["最大幅", "max-w-5xl（トップ）/ max-w-3xl（詳細）"],
  [],
  ["■ カテゴリ一覧"],
  ["カテゴリ名"],
  ["ChatGPT"], ["Claude"], ["Gemini"], ["画像生成"], ["コーディング"], ["その他"],
];
const ws2 = XLSX.utils.aoa_to_sheet(pages);
ws2["!cols"] = [{ wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 44 }, { wch: 34 }];
XLSX.utils.book_append_sheet(wb, ws2, "画面設計書");

// Sheet 3: データモデル設計書
const data = [
  ["PromptShare データモデル設計書"],
  [],
  ["■ Userテーブル"],
  ["カラム名", "型", "必須", "デフォルト", "説明"],
  ["id", "TEXT", "○", "cuid()", "主キー"],
  ["name", "TEXT", "○", "-", "表示名"],
  ["email", "TEXT", "○", "-", "メールアドレス（ユニーク）"],
  ["password", "TEXT", "○", "-", "bcryptハッシュ化済みパスワード"],
  ["createdAt", "TIMESTAMP(3)", "○", "現在日時", "作成日時"],
  [],
  ["■ Promptテーブル"],
  ["カラム名", "型", "必須", "デフォルト", "説明"],
  ["id", "TEXT", "○", "cuid()", "主キー"],
  ["title", "TEXT", "○", "-", "プロンプトタイトル"],
  ["content", "TEXT", "○", "-", "プロンプト本文"],
  ["category", "TEXT", "○", "-", "カテゴリ（ChatGPT/Claude等）"],
  ["tags", "TEXT", "○", "[]", "タグ（JSON配列を文字列として保存）"],
  ["copyCount", "INTEGER", "○", "0", "コピーされた回数"],
  ["authorId", "TEXT", "○", "-", "投稿者のUser.id（外部キー）"],
  ["createdAt", "TIMESTAMP(3)", "○", "現在日時", "作成日時"],
  [],
  ["■ Likeテーブル"],
  ["カラム名", "型", "必須", "デフォルト", "説明"],
  ["id", "TEXT", "○", "cuid()", "主キー"],
  ["userId", "TEXT", "○", "-", "いいねしたUser.id（外部キー）"],
  ["promptId", "TEXT", "○", "-", "いいねされたPrompt.id（外部キー）"],
  ["※ userId + promptId の組み合わせはユニーク制約あり"],
  [],
  ["■ Commentテーブル"],
  ["カラム名", "型", "必須", "デフォルト", "説明"],
  ["id", "TEXT", "○", "cuid()", "主キー"],
  ["body", "TEXT", "○", "-", "コメント本文"],
  ["userId", "TEXT", "○", "-", "投稿者のUser.id（外部キー）"],
  ["promptId", "TEXT", "○", "-", "対象のPrompt.id（外部キー）"],
  ["createdAt", "TIMESTAMP(3)", "○", "現在日時", "作成日時"],
];
const ws3 = XLSX.utils.aoa_to_sheet(data);
ws3["!cols"] = [{ wch: 14 }, { wch: 14 }, { wch: 8 }, { wch: 14 }, { wch: 40 }];
XLSX.utils.book_append_sheet(wb, ws3, "データモデル設計書");

// Sheet 4: API設計書
const api = [
  ["PromptShare API設計書"],
  [],
  ["エンドポイント", "メソッド", "認証", "説明", "リクエスト/レスポンス"],
  ["/api/auth/register", "POST", "不要", "ユーザー登録", "body: { name, email, password } → { id, name, email }"],
  ["/api/auth/[...nextauth]", "GET/POST", "不要", "NextAuth.js 認証ハンドラ", "ログイン・セッション管理"],
  ["/api/prompts", "GET", "不要", "プロンプト一覧取得", "query: sort(new/ranking), category, tag → Prompt[]"],
  ["/api/prompts/[id]/copy", "POST", "不要", "コピー数インクリメント", "→ { copyCount }"],
  ["/api/prompts/[id]/like", "POST", "必要", "いいねトグル", "→ { liked: boolean }"],
  ["/api/prompts/[id]/comments", "GET", "不要", "コメント一覧取得", "→ Comment[]"],
  ["/api/prompts/[id]/comments", "POST", "必要", "コメント投稿", "body: { body } → Comment"],
];
const ws4 = XLSX.utils.aoa_to_sheet(api);
ws4["!cols"] = [{ wch: 30 }, { wch: 12 }, { wch: 8 }, { wch: 26 }, { wch: 52 }];
XLSX.utils.book_append_sheet(wb, ws4, "API設計書");

// Sheet 5: 技術スタック
const tech = [
  ["PromptShare 技術スタック"],
  [],
  ["カテゴリ", "技術/サービス", "バージョン", "用途"],
  ["フロントエンド", "Next.js", "16.2.9", "Reactフレームワーク（App Router）"],
  ["フロントエンド", "React", "19.2.4", "UIライブラリ"],
  ["フロントエンド", "Tailwind CSS", "v4", "スタイリング"],
  ["フロントエンド", "TypeScript", "v5", "型安全な開発"],
  ["バックエンド", "Next.js Route Handlers", "-", "APIエンドポイント（サーバーレス関数）"],
  ["認証", "NextAuth.js", "4.24", "認証（Credentials Provider / JWT）"],
  ["認証", "bcryptjs", "3.0", "パスワードハッシュ化"],
  ["データベース", "PostgreSQL（Neon）", "-", "クラウドデータベース（無料枠）"],
  ["ORM", "Prisma", "7.8.0", "型安全なDBアクセス"],
  ["DB接続", "@prisma/adapter-neon", "7.8.0", "NeonサーバーレスDBアダプター"],
  ["ホスティング", "Vercel", "-", "サーバーレスホスティング（無料枠）"],
  ["コード管理", "GitHub", "-", "バージョン管理・CI/CDトリガー"],
  [],
  ["■ インフラ構成"],
  ["レイヤー", "内容"],
  ["ユーザー", "ブラウザからVercelのURLにアクセス"],
  ["フロントエンド", "VercelがNext.jsをサーバーレス関数として実行"],
  ["データベース", "Prisma経由でNeon PostgreSQLに接続"],
  ["CI/CD", "GitHubへのpushでVercelが自動デプロイ"],
];
const ws5 = XLSX.utils.aoa_to_sheet(tech);
ws5["!cols"] = [{ wch: 18 }, { wch: 28 }, { wch: 12 }, { wch: 46 }];
XLSX.utils.book_append_sheet(wb, ws5, "技術スタック");

XLSX.writeFile(wb, "PromptShare_設計書.xlsx");
console.log("done: PromptShare_設計書.xlsx");
