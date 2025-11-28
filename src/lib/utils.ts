import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

export function generateExcerpt(content: any, length: number = 150): string {
  if (typeof content === 'string') {
    return truncateText(content.replace(/<[^>]*>/g, ''), length)
  }

  if (Array.isArray(content)) {
    const text = content
      .filter((item: any) => item.type === 'text' || item.type === 'paragraph')
      .map((item: any) => item.text || item.content?.map((c: any) => c.text).join(' ') || '')
      .join(' ')
    return truncateText(text, length)
  }

  return ''
}