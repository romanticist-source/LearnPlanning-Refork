const fs = require("fs")
const path = require("path")

console.log("🚀 Learn Planning データベースセットアップを開始します...")

// 静的画像ディレクトリの作成
function createImageDirectories() {
  const STATIC_IMAGES_DIR = path.join(process.cwd(), "public", "images")
  const directories = ["avatars", "groups", "icons", "backgrounds", "attachments"]

  console.log("📁 画像ディレクトリを作成中...")

  directories.forEach((dir) => {
    const dirPath = path.join(STATIC_IMAGES_DIR, dir)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
      console.log(`   ✅ 作成: ${dirPath}`)
    } else {
      console.log(`   ⏭️  既存: ${dirPath}`)
    }
  })
}

// プレースホルダー画像の生成
function generatePlaceholderImages() {
  const STATIC_IMAGES_DIR = path.join(process.cwd(), "public", "images")
  const placeholders = [
    "avatars/tanaka.jpg",
    "avatars/sato.jpg",
    "avatars/suzuki.jpg",
    "avatars/takahashi.jpg",
    "avatars/ito.jpg",
    "avatars/watanabe.jpg",
    "avatars/default.jpg",
    "groups/programming-group.jpg",
    "groups/algorithm-group.jpg",
    "groups/webdev-group.jpg",
    "groups/database-group.jpg",
    "groups/default-group.jpg",
    "backgrounds/hero-bg.jpg",
    "backgrounds/dashboard-bg.jpg",
    "backgrounds/meeting-bg.jpg",
  ]

  console.log("🖼️  プレースホルダー画像を作成中...")

  placeholders.forEach((placeholder) => {
    const filePath = path.join(STATIC_IMAGES_DIR, placeholder)
    if (!fs.existsSync(filePath)) {
      // 空のファイルを作成（実際の画像に置き換えてください）
      fs.writeFileSync(filePath, "")
      console.log(`   ✅ 作成: ${placeholder}`)
    } else {
      console.log(`   ⏭️  既存: ${placeholder}`)
    }
  })
}

// データベースバックアップの作成
function createDatabaseBackup() {
  const dbPath = path.join(process.cwd(), "db.json")
  const backupPath = path.join(process.cwd(), "db.backup.json")

  if (fs.existsSync(dbPath) && !fs.existsSync(backupPath)) {
    fs.copyFileSync(dbPath, backupPath)
    console.log("💾 データベースバックアップを作成しました")
  }
}

// 環境変数ファイルの作成
function createEnvFile() {
  const envPath = path.join(process.cwd(), ".env.local")

  if (!fs.existsSync(envPath)) {
    const envContent = `# Learn Planning 環境変数
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STATIC_IMAGES_URL=/images

# 開発環境設定
NODE_ENV=development

# JSON Server設定
JSON_SERVER_PORT=3001
JSON_SERVER_HOST=localhost
`

    fs.writeFileSync(envPath, envContent)
    console.log("🔧 .env.localファイルを作成しました")
  } else {
    console.log("⏭️  .env.localファイルは既に存在します")
  }
}

// pnpm設定の確認
function checkPnpmSetup() {
  console.log("📦 pnpm設定を確認中...")

  // package.jsonの確認
  const packagePath = path.join(process.cwd(), "package.json")
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"))

    if (packageJson.packageManager && packageJson.packageManager.includes("pnpm")) {
      console.log("   ✅ pnpmがpackageManagerに設定されています")
    } else {
      console.log("   ⚠️  packageManagerにpnpmを設定することを推奨します")
    }

    if (packageJson.engines && packageJson.engines.pnpm) {
      console.log("   ✅ pnpmのバージョン制約が設定されています")
    }
  }

  // .npmrcの確認
  const npmrcPath = path.join(process.cwd(), ".npmrc")
  if (fs.existsSync(npmrcPath)) {
    console.log("   ✅ .npmrcファイルが存在します")
  } else {
    console.log("   ⚠️  .npmrcファイルの作成を推奨します")
  }
}

// Git設定の確認
function checkGitIgnore() {
  const gitignorePath = path.join(process.cwd(), ".gitignore")

  if (fs.existsSync(gitignorePath)) {
    let gitignoreContent = fs.readFileSync(gitignorePath, "utf8")

    const requiredEntries = [
      "# pnpm",
      ".pnpm-debug.log*",
      ".pnpm-store/",
      "",
      "# Database",
      "db.json",
      "!db.backup.json",
      "",
      "# Uploaded images",
      "public/images/attachments/*",
      "!public/images/attachments/.gitkeep",
    ]

    const missingEntries = requiredEntries.filter((entry) => entry === "" || !gitignoreContent.includes(entry))

    if (missingEntries.length > 0) {
      gitignoreContent += "\n" + missingEntries.join("\n") + "\n"
      fs.writeFileSync(gitignorePath, gitignoreContent)
      console.log("📝 .gitignoreを更新しました")
    } else {
      console.log("✅ .gitignoreは適切に設定されています")
    }
  }
}

// メイン実行関数
function main() {
  try {
    createImageDirectories()
    generatePlaceholderImages()
    createDatabaseBackup()
    createEnvFile()
    checkPnpmSetup()
    checkGitIgnore()

    console.log("\n🎉 セットアップが完了しました!")
    console.log("\n次のステップ:")
    console.log("1. 📸 public/images/ 内のプレースホルダーを実際の画像に置き換えてください")
    console.log("2. 🚀 アプリケーションを起動: pnpm dev:full")
    console.log("3. 🌐 ブラウザでアクセス: http://localhost:3000")
    console.log("4. 🔌 API確認: http://localhost:3001")
  } catch (error) {
    console.error("❌ セットアップ中にエラーが発生しました:", error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = {
  createImageDirectories,
  generatePlaceholderImages,
  createDatabaseBackup,
  createEnvFile,
  checkPnpmSetup,
  checkGitIgnore,
}
