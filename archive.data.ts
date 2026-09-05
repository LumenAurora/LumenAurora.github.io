import { createContentLoader } from 'vitepress'

export interface Post {
  title: string
  url: string
  date: string
  category: string
  tags: string[]
  description: string
}

export default createContentLoader('notes/**/*.md', {
  transform(raw): Post[] {
    return raw
      .map((p) => ({
        title: (p.frontmatter?.title as string) || '未命名',
        url: p.url,
        date: (p.frontmatter?.date as string) || '',
        category: (p.frontmatter?.category as string) || '未分类',
        tags: (p.frontmatter?.tags as string[]) || [],
        description: (p.frontmatter?.description as string) || '',
      }))
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  },
})
