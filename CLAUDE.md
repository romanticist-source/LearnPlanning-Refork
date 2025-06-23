# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Learn Planning is a Japanese group learning platform built with Next.js 15 and React 19. The application helps users create learning goals, manage groups, and track progress collaboratively.

## Architecture

- **Framework**: Next.js 15 with App Router
- **UI**: React 19 + TypeScript + Tailwind CSS
- **Components**: Radix UI primitives with custom styling using class-variance-authority
- **Theming**: next-themes with CSS variables for light/dark mode
- **Authentication**: NextAuth.js v5 (beta) with GitHub provider
- **Database**: JSON Server for development (db.json)
- **Package Manager**: pnpm (specified in packageManager field)

## Development Commands

```bash
# Install dependencies
pnpm install

# Development server (Next.js only)
pnpm dev

# Development server with JSON server
pnpm dev:full

# Start JSON server separately
pnpm db:start

# Build for production
pnpm build

# Start production server
pnpm start

# Type checking
pnpm type-check

# Linting
pnpm lint

# Database reset
pnpm db:reset

# Initial setup
pnpm setup
```

## File Structure & Conventions

- **Pages**: App Router structure in `/app` directory
- **Components**: Reusable components in `/components` with UI primitives in `/components/ui`
- **Styling**: Global styles in `/app/globals.css`, uses CSS variables for theming
- **Utils**: Shared utilities in `/lib/utils.ts`
- **API**: API routes in `/app/api`
- **Public Assets**: Static files in `/public`, images organized in `/public/images`

## Key Architecture Details

### Component Architecture
- Uses Radix UI primitives for accessibility and consistency
- Button variants managed with class-variance-authority (cva)
- Consistent use of forwardRef pattern for proper ref handling
- shadcn/ui component library structure

### Styling System
- Tailwind CSS with custom design tokens via CSS variables
- Dark mode support through next-themes
- Responsive design patterns
- Custom color palette defined in tailwind.config.ts

### Authentication Flow
- NextAuth.js v5 beta configuration in `/app/api/auth/auth.ts`
- GitHub OAuth provider configured
- Requires AUTH_GITHUB_ID and AUTH_GITHUB_SECRET environment variables

### Data Management
- JSON Server serves as development database on port 3005
- Database structure in db.json (currently minimal setup)
- Backup system with db.backup.json

## Development Environment

- **Node.js**: Uses pnpm as package manager
- **TypeScript**: Strict mode enabled with path aliases (@/*)
- **Ports**: Next.js on 3000, JSON Server on 3005
- **Languages**: Japanese UI text and comments

## Task Tracking & Documentation

このプロジェクトではすべてのタスクと改善を`.task`フォルダで記録します。

### 必須手順
1. **作業開始時**: TodoWriteツールでタスクリストを作成
2. **作業中**: タスクの進捗を随時更新
3. **作業完了時**: 以下のファイルを`.task`フォルダに保存
   - `todos/YYYY-MM-DD_HHmm_session.md` - そのセッションのTODOリスト
   - `improvements/YYYY-MM-DD_HHmm_improvement.md` - 実行した改善内容
   - `sessions/YYYY-MM-DD_HHmm_summary.md` - セッションの概要

### フォルダ構造
```
.task/
├── todos/          # 各セッションのTODOリスト
├── improvements/   # 実行された改善の記録
└── sessions/       # セッション履歴
```

### 記録内容
- **TODOリスト**: 計画したタスクと完了状況
- **改善記録**: 実装した機能、修正したバグ、リファクタリング内容
- **セッション概要**: 作業の目的、結果、次回への引き継ぎ事項

## Important Notes

- The project uses Next.js 15 and React 19 (latest versions)
- Environment variables should be in .env.local (not committed)
- Image assets are organized in public/images/ subdirectories
- The setup-database.js script initializes the development environment
- Uses Japanese locale (lang="ja" in layout.tsx)