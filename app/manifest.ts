import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LearnPlanning - 学習計画支援アプリ',
    short_name: 'LearnPlanning',
    description: 'グループ学習とコントリビューショングラフで学習を支援するPWAアプリ',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#059669', // emerald-600
    orientation: 'portrait-primary',
    scope: '/',
    categories: ['education', 'productivity'],
    lang: 'ja',
    
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any'
      }
    ],
    
    shortcuts: [
      {
        name: 'ダッシュボード',
        short_name: 'Dashboard',
        description: '学習進捗とグループ情報を確認',
        url: '/dashboard',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192'
          }
        ]
      },
      {
        name: '目標設定',
        short_name: 'Goals',
        description: '新しい学習目標を設定',
        url: '/goals',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192'
          }
        ]
      },
      {
        name: 'グループ',
        short_name: 'Groups',
        description: 'グループを作成・参加',
        url: '/groups',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192'
          }
        ]
      }
    ]
  }
}