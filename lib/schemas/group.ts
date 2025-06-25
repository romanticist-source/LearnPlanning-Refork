import { z } from "zod"

export const createGroupSchema = z.object({
  name: z
    .string()
    .min(1, "グループ名は必須です")
    .min(2, "グループ名は2文字以上で入力してください")
    .max(50, "グループ名は50文字以内で入力してください"),
  
  description: z
    .string()
    .min(1, "説明は必須です")
    .min(10, "説明は10文字以上で入力してください")
    .max(500, "説明は500文字以内で入力してください"),
  
  isPublic: z
    .boolean()
    .default(true),
  
  category: z
    .string()
    .min(1, "カテゴリーを選択してください"),
  
  maxMembers: z
    .number()
    .min(2, "最大メンバー数は2人以上を指定してください")
    .max(100, "最大メンバー数は100人以下を指定してください")
    .default(10),
  
  tags: z
    .array(z.string())
    .optional()
    .default([]),
  
  invitedMembers: z
    .array(
      z.object({
        email: z
          .string()
          .email("有効なメールアドレスを入力してください"),
        name: z
          .string()
          .min(1, "名前は必須です")
          .max(50, "名前は50文字以内で入力してください"),
      })
    )
    .optional()
    .default([]),
  
  allowMemberInvites: z
    .boolean()
    .default(true),
  
  requireApproval: z
    .boolean()
    .default(false),
})

export type CreateGroupFormData = z.infer<typeof createGroupSchema>

export const groupCategories: Array<{ value: string; label: string }> = [
  { value: "programming", label: "プログラミング" },
  { value: "web-development", label: "Web開発" },
  { value: "mobile-development", label: "モバイル開発" },
  { value: "data-science", label: "データサイエンス" },
  { value: "machine-learning", label: "機械学習" },
  { value: "algorithms", label: "アルゴリズム" },
  { value: "design", label: "デザイン" },
  { value: "language", label: "言語学習" },
  { value: "certification", label: "資格取得" },
  { value: "other", label: "その他" },
] 