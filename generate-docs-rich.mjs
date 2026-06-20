import { chromium } from "playwright";
import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";

const VERCEL_URL = "https://prompt-share-eight-alpha.vercel.app";
const OUT_DIR = "./doc-screenshots";
const OUT_FILE = "PromptShare_設計書_v2.xlsx";

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

// ── 色定義 ──────────────────────────────────
const C = {
  headerBg:   "FF4F46E5",  // indigo-600
  headerFont: "FFFFFFFF",
  subBg:      "FFE0E7FF",  // indigo-100
  subFont:    "FF3730A3",
  rowAlt:     "FFF9FAFB",  // gray-50
  border:     "FFD1D5DB",  // gray-300
  titleBg:    "FF1E1B4B",  // indigo-950
  titleFont:  "FFFFFFFF",
};

function applyBorder(ws, startRow, endRow, startCol, endCol) {
  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const cell = ws.getCell(r, c);
      cell.border = {
        top:    { style: "thin", color: { argb: C.border } },
        left:   { style: "thin", color: { argb: C.border } },
        bottom: { style: "thin", color: { argb: C.border } },
        right:  { style: "thin", color: { argb: C.border } },
      };
    }
  }
}

function headerRow(ws, row, values) {
  const r = ws.addRow(values);
  r.height = 22;
  r.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.headerBg } };
    cell.font = { bold: true, color: { argb: C.headerFont }, size: 10 };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  });
  return r;
}

function subHeader(ws, label, cols) {
  ws.addRow([]);
  const r = ws.addRow([label]);
  ws.mergeCells(r.number, 1, r.number, cols);
  r.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.subBg } };
  r.getCell(1).font = { bold: true, color: { argb: C.subFont }, size: 11 };
  r.getCell(1).alignment = { vertical: "middle" };
  r.height = 20;
  return r;
}

function dataRow(ws, values, alt = false) {
  const r = ws.addRow(values);
  r.height = 18;
  r.eachCell({ includeEmpty: true }, (cell) => {
    if (alt) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.rowAlt } };
    cell.alignment = { vertical: "middle", wrapText: true };
    cell.font = { size: 10 };
  });
  return r;
}

// ── スクリーンショット取得 ────────────────────
async function takeScreenshots() {
  console.log("ブラウザ起動中...");
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const pages = [
    { name: "top",      url: "/",           label: "トップページ" },
    { name: "login",    url: "/login",      label: "ログインページ" },
    { name: "register", url: "/register",   label: "新規登録ページ" },
  ];

  const results = [];
  for (const p of pages) {
    console.log(`  ${p.label} を撮影中...`);
    try {
      await page.goto(VERCEL_URL + p.url, { waitUntil: "networkidle", timeout: 20000 });
      await page.waitForTimeout(1500);
      const filePath = path.join(OUT_DIR, `${p.name}.png`);
      await page.screenshot({ path: filePath, fullPage: false });
      results.push({ ...p, filePath });
    } catch (e) {
      console.log(`    → 失敗 (${e.message.slice(0, 60)})`);
    }
  }

  // 詳細ページ: 最初のプロンプトIDを取得してアクセス
  try {
    await page.goto(VERCEL_URL, { waitUntil: "networkidle", timeout: 20000 });
    await page.waitForTimeout(1500);
    const firstLink = await page.$("a[href^='/prompts/']");
    if (firstLink) {
      const href = await firstLink.getAttribute("href");
      await page.goto(VERCEL_URL + href, { waitUntil: "networkidle", timeout: 20000 });
      await page.waitForTimeout(1500);
      const filePath = path.join(OUT_DIR, "detail.png");
      await page.screenshot({ path: filePath, fullPage: false });
      results.push({ name: "detail", url: href, label: "プロンプト詳細ページ", filePath });
    }
  } catch (e) {
    console.log("  詳細ページ撮影スキップ");
  }

  await browser.close();
  return results;
}

// ── Excel生成 ────────────────────────────────
async function buildExcel(screenshots) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "PromptShare";
  wb.created = new Date();

  // ━━━ 表紙 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    const ws = wb.addWorksheet("表紙");
    ws.getColumn(1).width = 60;
    ws.addRows([[], [], [], []]);
    const titleRow = ws.addRow(["PromptShare"]);
    ws.mergeCells("A5:A5");
    titleRow.getCell(1).font = { bold: true, size: 32, color: { argb: C.headerBg } };
    titleRow.getCell(1).alignment = { horizontal: "center" };
    titleRow.height = 50;

    ws.addRow([]);
    const sub = ws.addRow(["AIプロンプト共有プラットフォーム　要件定義書 / 設計書"]);
    sub.getCell(1).font = { size: 16, color: { argb: "FF6B7280" } };
    sub.getCell(1).alignment = { horizontal: "center" };
    sub.height = 30;

    ws.addRow([]);
    ws.addRow([]);
    const items = [
      ["サービス名", "PromptShare"],
      ["バージョン", "1.0.0"],
      ["作成日", new Date().toLocaleDateString("ja-JP")],
      ["ホスティング", "Vercel"],
      ["データベース", "Neon (PostgreSQL)"],
      ["リポジトリ", "github.com/hiroya082559-stack/PromptShare"],
      ["本番URL", "https://prompt-share-eight-alpha.vercel.app"],
    ];
    ws.getColumn("A").width = 20;
    ws.getColumn("B").width = 52;
    for (const [k, v] of items) {
      const r = ws.addRow([k, v]);
      r.getCell(1).font = { bold: true, size: 11 };
      r.getCell(2).font = { size: 11 };
      r.height = 20;
    }
  }

  // ━━━ 要件定義書 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    const ws = wb.addWorksheet("要件定義書");
    ws.getColumn(1).width = 18;
    ws.getColumn(2).width = 22;
    ws.getColumn(3).width = 46;
    ws.getColumn(4).width = 14;

    subHeader(ws, "■ サービス概要", 4);
    headerRow(ws, null, ["項目", "内容", "", ""]);
    ws.mergeCells(ws.lastRow.number, 2, ws.lastRow.number, 4);

    const overview = [
      ["サービス名", "PromptShare"],
      ["概要", "AIプロンプトを投稿・共有・発見できるコミュニティプラットフォーム"],
      ["目的", "ユーザーが便利なAIプロンプトを共有し、他ユーザーが活用できる場を提供する"],
      ["対象ユーザー", "ChatGPT・Claude・Gemini等のAIツールを日常的に使うユーザー"],
    ];
    overview.forEach(([k, v], i) => {
      const r = ws.addRow([k, v]);
      ws.mergeCells(r.number, 2, r.number, 4);
      r.getCell(1).font = { bold: true, size: 10 };
      r.getCell(2).font = { size: 10 };
      if (i % 2 === 1) {
        r.eachCell(c => c.fill = { type:"pattern", pattern:"solid", fgColor: { argb: C.rowAlt } });
      }
      r.height = 18;
    });
    applyBorder(ws, ws.lastRow.number - 3, ws.lastRow.number, 1, 4);

    subHeader(ws, "■ 機能要件", 4);
    headerRow(ws, null, ["機能カテゴリ", "機能名", "説明", "ログイン必須"]);

    const funcs = [
      ["認証", "ユーザー登録", "名前・メール・パスワードでアカウント作成", "不要"],
      ["認証", "ログイン", "メール・パスワードでログイン（JWTセッション）", "不要"],
      ["認証", "ログアウト", "セッションを破棄してトップページへ遷移", "必要"],
      ["プロンプト", "一覧表示", "プロンプトをカード形式で一覧表示", "不要"],
      ["プロンプト", "新着順表示", "投稿日時の降順で表示", "不要"],
      ["プロンプト", "人気順表示", "いいね数の降順で表示", "不要"],
      ["プロンプト", "カテゴリフィルター", "ChatGPT/Claude/Gemini/画像生成/コーディング/その他", "不要"],
      ["プロンプト", "タグ検索", "タグキーワードで部分一致絞り込み", "不要"],
      ["プロンプト", "詳細表示", "タイトル・本文・著者・タグ・コピー数・いいね数を表示", "不要"],
      ["プロンプト", "プロンプトコピー", "本文をクリップボードにコピー・コピー数をDBに記録", "不要"],
      ["プロンプト", "投稿", "タイトル・本文・カテゴリ・タグを入力して投稿", "必要"],
      ["インタラクション", "いいね", "プロンプトへのいいねをトグル（即時反映）", "必要"],
      ["インタラクション", "コメント閲覧", "プロンプト詳細ページでコメント一覧を表示", "不要"],
      ["インタラクション", "コメント投稿", "プロンプトへのコメントを投稿", "必要"],
      ["マイページ", "自分の投稿一覧", "ログイン中ユーザーが投稿したプロンプトを一覧表示", "必要"],
    ];
    const funcStart = ws.lastRow.number + 1;
    funcs.forEach(([cat, name, desc, auth], i) => {
      const r = dataRow(ws, [cat, name, desc, auth], i % 2 === 1);
      if (auth === "必要") r.getCell(4).font = { bold: true, color: { argb: "FFDC2626" }, size: 10 };
      if (auth === "不要") r.getCell(4).font = { color: { argb: "FF6B7280" }, size: 10 };
    });
    applyBorder(ws, funcStart, ws.lastRow.number, 1, 4);

    subHeader(ws, "■ 非機能要件", 4);
    headerRow(ws, null, ["項目", "内容", "", ""]);
    ws.mergeCells(ws.lastRow.number, 2, ws.lastRow.number, 4);
    const nonfuncs = [
      ["ホスティング", "Vercel（サーバーレス・無料枠）"],
      ["データベース", "Neon PostgreSQL（クラウド・無料枠 0.5GB）"],
      ["認証方式", "JWT（NextAuth.js Credentials Provider）"],
      ["レスポンシブ", "PC・タブレット・スマートフォン対応"],
      ["セキュリティ", "bcryptでパスワードハッシュ化・環境変数で機密情報管理"],
      ["コスト", "全サービス無料枠内で運用可能"],
    ];
    const nfStart = ws.lastRow.number + 1;
    nonfuncs.forEach(([k, v], i) => {
      const r = dataRow(ws, [k, v], i % 2 === 1);
      ws.mergeCells(r.number, 2, r.number, 4);
      r.getCell(1).font = { bold: true, size: 10 };
    });
    applyBorder(ws, nfStart, ws.lastRow.number, 1, 4);
  }

  // ━━━ 画面設計書 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    const ws = wb.addWorksheet("画面設計書");
    ws.getColumn(1).width = 20;
    ws.getColumn(2).width = 24;
    ws.getColumn(3).width = 20;
    ws.getColumn(4).width = 46;

    subHeader(ws, "■ 画面一覧", 4);
    headerRow(ws, null, ["画面名", "URL", "認証", "説明"]);

    const screenList = [
      ["トップページ", "/", "不要", "プロンプト一覧。新着/人気タブ・カテゴリ・タグで絞り込み可能"],
      ["プロンプト詳細", "/prompts/[id]", "一部必要", "本文全文・コピーボタン・いいね・コメント一覧"],
      ["プロンプト投稿", "/prompts/new", "必要", "タイトル・本文・カテゴリ・タグを入力して投稿"],
      ["ログイン", "/login", "不要", "メール・パスワードでログイン"],
      ["新規登録", "/register", "不要", "名前・メール・パスワードでアカウント作成"],
      ["マイページ", "/mypage", "必要", "自分の投稿プロンプト一覧"],
    ];
    const slStart = ws.lastRow.number + 1;
    screenList.forEach(([name, url, auth, desc], i) => {
      const r = dataRow(ws, [name, url, auth, desc], i % 2 === 1);
      r.getCell(2).font = { color: { argb: "FF4F46E5" }, size: 10 };
    });
    applyBorder(ws, slStart, ws.lastRow.number, 1, 4);

    subHeader(ws, "■ 共通レイアウト", 4);
    const layout = [
      ["ナビゲーションバー", "ロゴ（トップリンク）/ 投稿ボタン / ログイン・ログアウト / マイページ"],
      ["背景色", "gray-50（薄いグレー）"],
      ["最大幅", "max-w-5xl（トップ）/ max-w-3xl（詳細）"],
      ["フォント", "Geist Sans（Google Fonts）"],
    ];
    const layoutStart = ws.lastRow.number + 1;
    layout.forEach(([k, v], i) => {
      const r = dataRow(ws, [k, v], i % 2 === 1);
      ws.mergeCells(r.number, 2, r.number, 4);
      r.getCell(1).font = { bold: true, size: 10 };
    });
    applyBorder(ws, layoutStart, ws.lastRow.number, 1, 4);

    // スクリーンショット埋め込み
    if (screenshots.length > 0) {
      subHeader(ws, "■ 画面スクリーンショット", 4);
      ws.addRow([]);

      for (const s of screenshots) {
        if (!s.filePath || !fs.existsSync(s.filePath)) continue;
        const labelRow = ws.addRow([s.label + "  (" + s.url + ")"]);
        labelRow.getCell(1).font = { bold: true, size: 11, color: { argb: C.subFont } };
        ws.mergeCells(labelRow.number, 1, labelRow.number, 4);
        labelRow.height = 20;

        const imgId = wb.addImage({ filename: s.filePath, extension: "png" });
        ws.addImage(imgId, {
          tl: { col: 0, row: ws.lastRow.number },
          ext: { width: 900, height: 563 },
        });
        // 画像の高さ分だけ行を追加（約42行）
        for (let i = 0; i < 42; i++) ws.addRow([]);
        ws.addRow([]);
      }
    }
  }

  // ━━━ 画面遷移図 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    const ws = wb.addWorksheet("画面遷移図");
    ws.getColumn(1).width = 3;
    for (let i = 2; i <= 20; i++) ws.getColumn(i).width = 14;

    const addTitle = (row, text) => {
      const r = ws.getRow(row);
      r.height = 24;
      const cell = r.getCell(2);
      cell.value = text;
      cell.font = { bold: true, size: 13, color: { argb: C.subFont } };
      ws.mergeCells(row, 2, row, 20);
    };

    const box = (ws, row, col, text, bg = C.headerBg, fg = C.headerFont) => {
      const cell = ws.getCell(row, col);
      cell.value = text;
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
      cell.font = { bold: true, size: 10, color: { argb: fg } };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = {
        top:    { style: "medium", color: { argb: C.headerBg } },
        left:   { style: "medium", color: { argb: C.headerBg } },
        bottom: { style: "medium", color: { argb: C.headerBg } },
        right:  { style: "medium", color: { argb: C.headerBg } },
      };
      ws.getRow(row).height = 36;
    };

    const arrow = (ws, row, col, dir = "→") => {
      const cell = ws.getCell(row, col);
      cell.value = dir;
      cell.font = { size: 14, color: { argb: "FF9CA3AF" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    };

    addTitle(1, "PromptShare 画面遷移図");

    // 凡例
    ws.getRow(3).height = 18;
    ws.getCell(3, 2).value = "■ 未ログイン時の遷移";
    ws.getCell(3, 2).font = { bold: true, size: 11 };
    ws.mergeCells(3, 2, 3, 10);

    // 未ログイン
    box(ws, 5, 2,  "トップページ\n/");
    arrow(ws, 5, 3);
    box(ws, 5, 4,  "プロンプト詳細\n/prompts/[id]");
    arrow(ws, 5, 5);
    box(ws, 5, 6,  "ログインへ誘導\n(いいね/コメント時)");

    ws.getCell(7, 2).value = "↓ ログインへ";
    ws.getCell(7, 2).font = { color: { argb: "FF6B7280" }, size: 10 };
    ws.getCell(7, 2).alignment = { horizontal: "center" };

    box(ws, 9, 2,  "ログインページ\n/login");
    arrow(ws, 9, 3);
    box(ws, 9, 4,  "トップページへ\n（ログイン成功）");

    ws.getCell(11, 4).value = "↑ アカウント作成";
    ws.getCell(11, 4).font = { color: { argb: "FF6B7280" }, size: 10 };
    ws.getCell(11, 4).alignment = { horizontal: "center" };

    box(ws, 13, 4, "新規登録ページ\n/register");
    arrow(ws, 13, 5);
    box(ws, 13, 6, "ログインページへ\n（登録成功）");

    ws.getRow(15).height = 18;
    ws.getCell(15, 2).value = "■ ログイン後の遷移";
    ws.getCell(15, 2).font = { bold: true, size: 11 };
    ws.mergeCells(15, 2, 15, 14);

    // ログイン後
    box(ws, 17, 2,  "トップページ\n/", "FF4338CA", "FFFFFFFF");
    arrow(ws, 17, 3);
    box(ws, 17, 4,  "プロンプト詳細\n/prompts/[id]", "FF4338CA", "FFFFFFFF");

    ws.getCell(17, 6).value = "→ いいね（その場でトグル）";
    ws.getCell(17, 6).font = { size: 10, color: { argb: "FF059669" } };
    ws.mergeCells(17, 6, 17, 9);
    ws.getCell(17, 6).alignment = { vertical: "middle" };

    ws.getCell(19, 4).value = "↓ コメント投稿";
    ws.getCell(19, 4).font = { color: { argb: "FF6B7280" }, size: 10 };
    ws.getCell(19, 4).alignment = { horizontal: "center" };

    box(ws, 21, 4,  "コメント送信\n（その場で反映）", "FFD1FAE5", "FF065F46");

    ws.getCell(19, 2).value = "↓ 投稿ボタン";
    ws.getCell(19, 2).font = { color: { argb: "FF6B7280" }, size: 10 };
    ws.getCell(19, 2).alignment = { horizontal: "center" };

    box(ws, 21, 2,  "投稿ページ\n/prompts/new", "FF4338CA", "FFFFFFFF");
    arrow(ws, 21, 3);
    box(ws, 21, 10, "マイページ\n/mypage", "FF4338CA", "FFFFFFFF");

    ws.getCell(19, 10).value = "↓ マイページ";
    ws.getCell(19, 10).font = { color: { argb: "FF6B7280" }, size: 10 };
    ws.getCell(19, 10).alignment = { horizontal: "center" };
  }

  // ━━━ データモデル設計書 ━━━━━━━━━━━━━━━━━━━━━━
  {
    const ws = wb.addWorksheet("データモデル設計書");
    ws.getColumn(1).width = 18;
    ws.getColumn(2).width = 16;
    ws.getColumn(3).width = 8;
    ws.getColumn(4).width = 14;
    ws.getColumn(5).width = 42;

    const tables = [
      {
        name: "User テーブル",
        cols: ["カラム名", "型", "必須", "デフォルト", "説明"],
        rows: [
          ["id", "TEXT", "○", "cuid()", "主キー（ID自動生成）"],
          ["name", "TEXT", "○", "-", "ユーザー表示名"],
          ["email", "TEXT", "○", "-", "メールアドレス（ユニーク制約）"],
          ["password", "TEXT", "○", "-", "bcryptハッシュ化済みパスワード"],
          ["createdAt", "TIMESTAMP(3)", "○", "現在日時", "アカウント作成日時"],
        ],
        rel: "Prompt（1:N）/ Like（1:N）/ Comment（1:N）",
      },
      {
        name: "Prompt テーブル",
        cols: ["カラム名", "型", "必須", "デフォルト", "説明"],
        rows: [
          ["id", "TEXT", "○", "cuid()", "主キー"],
          ["title", "TEXT", "○", "-", "プロンプトタイトル"],
          ["content", "TEXT", "○", "-", "プロンプト本文（全文）"],
          ["category", "TEXT", "○", "-", "カテゴリ（ChatGPT/Claude/Gemini等）"],
          ["tags", "TEXT", "○", "[]", "タグ（JSON配列を文字列として保存）"],
          ["copyCount", "INTEGER", "○", "0", "コピーされた累計回数"],
          ["authorId", "TEXT", "○", "-", "投稿者のUser.id（外部キー）"],
          ["createdAt", "TIMESTAMP(3)", "○", "現在日時", "投稿日時"],
        ],
        rel: "User（N:1）/ Like（1:N）/ Comment（1:N）",
      },
      {
        name: "Like テーブル",
        cols: ["カラム名", "型", "必須", "デフォルト", "説明"],
        rows: [
          ["id", "TEXT", "○", "cuid()", "主キー"],
          ["userId", "TEXT", "○", "-", "いいねしたUser.id（外部キー）"],
          ["promptId", "TEXT", "○", "-", "いいねされたPrompt.id（外部キー）"],
        ],
        note: "userId + promptId の組み合わせにユニーク制約（同一ユーザーの重複いいね防止）",
        rel: "User（N:1）/ Prompt（N:1）",
      },
      {
        name: "Comment テーブル",
        cols: ["カラム名", "型", "必須", "デフォルト", "説明"],
        rows: [
          ["id", "TEXT", "○", "cuid()", "主キー"],
          ["body", "TEXT", "○", "-", "コメント本文"],
          ["userId", "TEXT", "○", "-", "投稿者のUser.id（外部キー）"],
          ["promptId", "TEXT", "○", "-", "対象のPrompt.id（外部キー）"],
          ["createdAt", "TIMESTAMP(3)", "○", "現在日時", "コメント投稿日時"],
        ],
        rel: "User（N:1）/ Prompt（N:1）",
      },
    ];

    for (const t of tables) {
      subHeader(ws, "■ " + t.name, 5);
      if (t.rel) {
        const relRow = ws.addRow(["リレーション: " + t.rel]);
        ws.mergeCells(relRow.number, 1, relRow.number, 5);
        relRow.getCell(1).font = { italic: true, color: { argb: "FF6B7280" }, size: 10 };
      }
      headerRow(ws, null, t.cols);
      const start = ws.lastRow.number + 1;
      t.rows.forEach((row, i) => {
        const r = dataRow(ws, row, i % 2 === 1);
        r.getCell(1).font = { bold: true, size: 10 };
        if (row[2] === "○") r.getCell(3).font = { bold: true, color: { argb: "FF059669" }, size: 10 };
      });
      applyBorder(ws, start, ws.lastRow.number, 1, 5);
      if (t.note) {
        const nr = ws.addRow(["※ " + t.note]);
        ws.mergeCells(nr.number, 1, nr.number, 5);
        nr.getCell(1).font = { italic: true, color: { argb: "FFB45309" }, size: 10 };
      }
    }
  }

  // ━━━ API設計書 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    const ws = wb.addWorksheet("API設計書");
    ws.getColumn(1).width = 32;
    ws.getColumn(2).width = 12;
    ws.getColumn(3).width = 10;
    ws.getColumn(4).width = 22;
    ws.getColumn(5).width = 50;

    subHeader(ws, "■ エンドポイント一覧", 5);
    headerRow(ws, null, ["エンドポイント", "メソッド", "認証", "説明", "リクエスト / レスポンス"]);

    const apis = [
      ["/api/auth/register",           "POST",     "不要", "ユーザー登録",       "body: { name, email, password } → { id, name, email }"],
      ["/api/auth/[...nextauth]",       "GET/POST", "不要", "NextAuth 認証ハンドラ", "ログイン・ログアウト・セッション管理"],
      ["/api/prompts",                  "GET",      "不要", "プロンプト一覧取得", "query: sort(new|ranking), category, tag → Prompt[]"],
      ["/api/prompts/[id]/copy",        "POST",     "不要", "コピー数記録",       "→ { copyCount: number }"],
      ["/api/prompts/[id]/like",        "POST",     "必要", "いいねトグル",       "→ { liked: boolean }"],
      ["/api/prompts/[id]/comments",    "GET",      "不要", "コメント一覧取得",   "→ Comment[]"],
      ["/api/prompts/[id]/comments",    "POST",     "必要", "コメント投稿",       "body: { body: string } → Comment"],
    ];

    const apiStart = ws.lastRow.number + 1;
    apis.forEach((row, i) => {
      const r = dataRow(ws, row, i % 2 === 1);
      r.getCell(1).font = { color: { argb: "FF4F46E5" }, size: 10 };
      const method = row[1];
      const methodColors = { GET: "FF059669", POST: "FFD97706", "GET/POST": "FF0284C7" };
      r.getCell(2).font = { bold: true, color: { argb: methodColors[method] || "FF374151" }, size: 10 };
      if (row[2] === "必要") r.getCell(3).font = { bold: true, color: { argb: "FFDC2626" }, size: 10 };
    });
    applyBorder(ws, apiStart, ws.lastRow.number, 1, 5);

    subHeader(ws, "■ 認証方式", 5);
    const authItems = [
      ["方式", "JWT（JSON Web Token）"],
      ["ライブラリ", "NextAuth.js v4"],
      ["プロバイダ", "Credentials（メール＋パスワード）"],
      ["セッション", "サーバーサイドJWT / Cookieで管理"],
      ["認証チェック", "getServerSession(authOptions) でサーバー側確認"],
    ];
    const authStart = ws.lastRow.number + 1;
    authItems.forEach(([k, v], i) => {
      const r = dataRow(ws, [k, v], i % 2 === 1);
      ws.mergeCells(r.number, 2, r.number, 5);
      r.getCell(1).font = { bold: true, size: 10 };
    });
    applyBorder(ws, authStart, ws.lastRow.number, 1, 5);
  }

  // ━━━ 技術スタック ━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    const ws = wb.addWorksheet("技術スタック");
    ws.getColumn(1).width = 18;
    ws.getColumn(2).width = 28;
    ws.getColumn(3).width = 14;
    ws.getColumn(4).width = 46;

    subHeader(ws, "■ 使用技術一覧", 4);
    headerRow(ws, null, ["カテゴリ", "技術 / サービス", "バージョン", "用途"]);

    const stack = [
      ["フロントエンド", "Next.js",                "16.2.9", "Reactフレームワーク（App Router / サーバーコンポーネント）"],
      ["フロントエンド", "React",                  "19.2.4", "UIライブラリ"],
      ["フロントエンド", "Tailwind CSS",            "v4",     "ユーティリティファーストCSSフレームワーク"],
      ["フロントエンド", "TypeScript",              "v5",     "型安全な開発（全ファイル .tsx/.ts）"],
      ["バックエンド",   "Next.js Route Handlers",  "-",      "APIエンドポイント（サーバーレス関数として動作）"],
      ["認証",          "NextAuth.js",              "4.24",   "認証ライブラリ（Credentials Provider / JWT）"],
      ["認証",          "bcryptjs",                 "3.0",    "パスワードのハッシュ化・検証"],
      ["データベース",  "PostgreSQL（Neon）",        "-",      "クラウドPostgreSQL・無料枠 0.5GB・500時間/月"],
      ["ORM",           "Prisma",                   "7.8.0",  "型安全なDBクライアント生成・マイグレーション管理"],
      ["DB接続",        "@prisma/adapter-neon",     "7.8.0",  "NeonサーバーレスWebSocketアダプター"],
      ["DB接続",        "@neondatabase/serverless",  "1.1",    "Neon用サーバーレスドライバー"],
      ["ホスティング",  "Vercel",                   "-",      "Next.js最適化サーバーレスホスティング・無料枠"],
      ["コード管理",    "GitHub",                   "-",      "バージョン管理・VercelのCI/CDトリガー"],
    ];

    const sStart = ws.lastRow.number + 1;
    stack.forEach((row, i) => dataRow(ws, row, i % 2 === 1));
    applyBorder(ws, sStart, ws.lastRow.number, 1, 4);

    subHeader(ws, "■ インフラ構成", 4);
    const infra = [
      ["1. ユーザー",       "ブラウザから prompt-share-eight-alpha.vercel.app にアクセス"],
      ["2. Vercel CDN",     "静的アセット（JS/CSS/画像）をEdgeから高速配信"],
      ["3. Vercel Functions","Next.js サーバーコンポーネント・APIをサーバーレス関数として実行"],
      ["4. Prisma ORM",     "型安全なクエリをNeon向けSQL文に変換"],
      ["5. Neon PostgreSQL", "クラウドPostgreSQLでデータを永続化"],
      ["6. CI/CD",          "GitHub mainブランチへのpushでVercelが自動ビルド・デプロイ"],
    ];
    const iStart = ws.lastRow.number + 1;
    infra.forEach(([k, v], i) => {
      const r = dataRow(ws, [k, v], i % 2 === 1);
      ws.mergeCells(r.number, 2, r.number, 4);
      r.getCell(1).font = { bold: true, size: 10 };
    });
    applyBorder(ws, iStart, ws.lastRow.number, 1, 4);
  }

  await wb.xlsx.writeFile(OUT_FILE);
  console.log(`✅ 完了: ${OUT_FILE}`);
}

// ── メイン ───────────────────────────────────
async function main() {
  let screenshots = [];
  try {
    screenshots = await takeScreenshots();
    console.log(`スクリーンショット: ${screenshots.length}件`);
  } catch (e) {
    console.log("スクリーンショット取得に失敗しました:", e.message);
  }
  await buildExcel(screenshots);
}

main().catch(console.error);
