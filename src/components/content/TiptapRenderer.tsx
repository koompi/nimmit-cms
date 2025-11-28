'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// Types for Tiptap JSON structure
interface TiptapMark {
  type: string
  attrs?: Record<string, unknown>
}

interface TiptapNode {
  type: string
  attrs?: Record<string, unknown>
  content?: TiptapNode[]
  text?: string
  marks?: TiptapMark[]
}

interface TiptapDoc {
  type: 'doc'
  content: TiptapNode[]
}

// Accept broader types for flexibility with Prisma JSON fields
type TiptapContent = TiptapDoc | { type: 'doc'; content: unknown[] } | null | undefined

interface TiptapRendererProps {
  content: TiptapContent
  className?: string
}

// Render marks (bold, italic, link, etc.)
function renderMarks(text: string, marks?: TiptapMark[]): React.ReactNode {
  if (!marks || marks.length === 0) return text

  return marks.reduce((acc: React.ReactNode, mark) => {
    switch (mark.type) {
      case 'bold':
        return <strong>{acc}</strong>
      case 'italic':
        return <em>{acc}</em>
      case 'underline':
        return <u>{acc}</u>
      case 'strike':
        return <s>{acc}</s>
      case 'code':
        return <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{acc}</code>
      case 'link':
        const href = mark.attrs?.href as string
        const target = mark.attrs?.target as string
        return (
          <Link 
            href={href || '#'} 
            target={target || '_self'}
            className="text-primary underline hover:no-underline"
          >
            {acc}
          </Link>
        )
      case 'textStyle':
        const color = mark.attrs?.color as string
        return <span style={{ color }}>{acc}</span>
      case 'highlight':
        const bgColor = mark.attrs?.color as string || '#fef08a'
        return <mark style={{ backgroundColor: bgColor }}>{acc}</mark>
      default:
        return acc
    }
  }, text)
}

// Render a single node
function renderNode(node: TiptapNode, index: number): React.ReactNode {
  const key = `${node.type}-${index}`

  switch (node.type) {
    case 'text':
      return <Fragment key={key}>{renderMarks(node.text || '', node.marks)}</Fragment>

    case 'paragraph':
      return (
        <p key={key} className="mb-4 last:mb-0" style={getTextAlignStyle(node.attrs)}>
          {node.content?.map((child, i) => renderNode(child, i))}
        </p>
      )

    case 'heading':
      const level = (node.attrs?.level as number) || 1
      const headingClasses: Record<number, string> = {
        1: 'text-4xl font-bold mb-6 mt-8 first:mt-0',
        2: 'text-3xl font-bold mb-4 mt-6 first:mt-0',
        3: 'text-2xl font-semibold mb-3 mt-5 first:mt-0',
        4: 'text-xl font-semibold mb-2 mt-4 first:mt-0',
        5: 'text-lg font-medium mb-2 mt-3 first:mt-0',
        6: 'text-base font-medium mb-2 mt-2 first:mt-0',
      }
      const headingStyle = getTextAlignStyle(node.attrs)
      const headingContent = node.content?.map((child, i) => renderNode(child, i))
      
      switch (level) {
        case 1: return <h1 key={key} className={headingClasses[1]} style={headingStyle}>{headingContent}</h1>
        case 2: return <h2 key={key} className={headingClasses[2]} style={headingStyle}>{headingContent}</h2>
        case 3: return <h3 key={key} className={headingClasses[3]} style={headingStyle}>{headingContent}</h3>
        case 4: return <h4 key={key} className={headingClasses[4]} style={headingStyle}>{headingContent}</h4>
        case 5: return <h5 key={key} className={headingClasses[5]} style={headingStyle}>{headingContent}</h5>
        case 6: return <h6 key={key} className={headingClasses[6]} style={headingStyle}>{headingContent}</h6>
        default: return <h2 key={key} className={headingClasses[2]} style={headingStyle}>{headingContent}</h2>
      }

    case 'bulletList':
      return (
        <ul key={key} className="list-disc pl-6 mb-4 space-y-1">
          {node.content?.map((child, i) => renderNode(child, i))}
        </ul>
      )

    case 'orderedList':
      return (
        <ol key={key} className="list-decimal pl-6 mb-4 space-y-1" start={node.attrs?.start as number}>
          {node.content?.map((child, i) => renderNode(child, i))}
        </ol>
      )

    case 'listItem':
      return (
        <li key={key}>
          {node.content?.map((child, i) => renderNode(child, i))}
        </li>
      )

    case 'blockquote':
      return (
        <blockquote key={key} className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
          {node.content?.map((child, i) => renderNode(child, i))}
        </blockquote>
      )

    case 'codeBlock':
      return (
        <pre key={key} className="bg-muted p-4 rounded-lg overflow-x-auto my-4">
          <code className="text-sm font-mono">
            {node.content?.map((child) => child.text).join('')}
          </code>
        </pre>
      )

    case 'horizontalRule':
      return <hr key={key} className="my-8 border-border" />

    case 'hardBreak':
      return <br key={key} />

    case 'image':
      const imgSrc = node.attrs?.src as string
      const imgAlt = (node.attrs?.alt as string) || ''
      const imgTitle = node.attrs?.title as string | undefined
      return (
        <figure key={key} className="my-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={imgAlt}
            title={imgTitle}
            className="rounded-lg max-w-full h-auto mx-auto"
          />
          {imgTitle && (
            <figcaption className="text-center text-sm text-muted-foreground mt-2">
              {imgTitle}
            </figcaption>
          )}
        </figure>
      )

    // Custom Blocks
    case 'heroBlock':
      return <HeroBlockRenderer key={key} attrs={node.attrs} />

    case 'productGridBlock':
      return <ProductGridBlockRenderer key={key} attrs={node.attrs} />

    case 'testimonialBlock':
      return <TestimonialBlockRenderer key={key} attrs={node.attrs} />

    case 'galleryBlock':
      return <GalleryBlockRenderer key={key} attrs={node.attrs} />

    case 'videoEmbedBlock':
      return <VideoEmbedBlockRenderer key={key} attrs={node.attrs} />

    case 'callToActionBlock':
      return <CallToActionBlockRenderer key={key} attrs={node.attrs} />

    default:
      // Fallback: try to render content if it exists
      if (node.content) {
        return (
          <div key={key}>
            {node.content.map((child, i) => renderNode(child, i))}
          </div>
        )
      }
      return null
  }
}

// Helper for text alignment
function getTextAlignStyle(attrs?: Record<string, unknown>): React.CSSProperties {
  const textAlign = attrs?.textAlign as string
  if (textAlign && ['left', 'center', 'right', 'justify'].includes(textAlign)) {
    return { textAlign: textAlign as 'left' | 'center' | 'right' | 'justify' }
  }
  return {}
}

// ==========================================
// Custom Block Renderers
// ==========================================

interface HeroAttrs {
  imageUrl?: string
  title?: string
  subtitle?: string
  ctaText?: string
  ctaUrl?: string
  secondaryCtaText?: string
  secondaryCtaUrl?: string
  alignment?: 'left' | 'center' | 'right'
  overlayOpacity?: number
}

function HeroBlockRenderer({ attrs }: { attrs?: Record<string, unknown> }) {
  const a = (attrs || {}) as HeroAttrs
  const imageUrl = a.imageUrl || ''
  const title = a.title || ''
  const subtitle = a.subtitle || ''
  const ctaText = a.ctaText || ''
  const ctaUrl = a.ctaUrl || ''
  const secondaryCtaText = a.secondaryCtaText || ''
  const secondaryCtaUrl = a.secondaryCtaUrl || ''
  const alignment = a.alignment || 'center'
  const overlayOpacity = a.overlayOpacity ?? 50

  const alignmentClasses = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right',
  }

  return (
    <section className="relative min-h-[60vh] flex items-center justify-center my-8 rounded-xl overflow-hidden">
      {imageUrl && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div 
            className="absolute inset-0 bg-black" 
            style={{ opacity: overlayOpacity / 100 }}
          />
        </>
      )}
      <div className={cn(
        'relative z-10 flex flex-col p-8 max-w-4xl',
        alignmentClasses[alignment]
      )}>
        {title && (
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-xl text-white/90 mb-6 max-w-2xl">
            {subtitle}
          </p>
        )}
        <div className="flex flex-wrap gap-4">
          {ctaText && ctaUrl && (
            <Link
              href={ctaUrl}
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition"
            >
              {ctaText}
            </Link>
          )}
          {secondaryCtaText && secondaryCtaUrl && (
            <Link
              href={secondaryCtaUrl}
              className="inline-flex items-center justify-center px-6 py-3 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition border border-white/30"
            >
              {secondaryCtaText}
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}

interface ProductGridAttrs {
  title?: string
  productIds?: string[]
  columns?: 2 | 3 | 4
}

function ProductGridBlockRenderer({ attrs }: { attrs?: Record<string, unknown> }) {
  const a = (attrs || {}) as ProductGridAttrs
  const title = a.title || ''
  const productIds = a.productIds || []
  const columns = a.columns || 3

  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <section className="my-8">
      {title && (
        <h3 className="text-2xl font-bold mb-6">{title}</h3>
      )}
      <div className={cn('grid gap-6', columnClasses[columns])}>
        {productIds.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center py-8">
            No products selected
          </p>
        ) : (
          <p className="text-muted-foreground col-span-full text-center py-8">
            Product grid: {productIds.length} products
          </p>
        )}
      </div>
    </section>
  )
}

interface TestimonialAttrs {
  quote?: string
  authorName?: string
  authorTitle?: string
  authorImage?: string
  rating?: number
}

function TestimonialBlockRenderer({ attrs }: { attrs?: Record<string, unknown> }) {
  const a = (attrs || {}) as TestimonialAttrs
  const quote = a.quote || ''
  const authorName = a.authorName || ''
  const authorTitle = a.authorTitle || ''
  const authorImage = a.authorImage || ''
  const rating = a.rating ?? 5

  return (
    <blockquote className="my-8 p-8 bg-muted rounded-xl">
      {rating > 0 && (
        <div className="flex gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={cn(
                'w-5 h-5',
                i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
              )}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      )}
      <p className="text-xl italic mb-6">&ldquo;{quote}&rdquo;</p>
      <footer className="flex items-center gap-4">
        {authorImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={authorImage}
            alt={authorName}
            className="w-12 h-12 rounded-full object-cover"
          />
        )}
        <div>
          <cite className="not-italic font-semibold">{authorName}</cite>
          {authorTitle && (
            <p className="text-sm text-muted-foreground">{authorTitle}</p>
          )}
        </div>
      </footer>
    </blockquote>
  )
}

interface GalleryImage {
  url: string
  alt?: string
  caption?: string
}

interface GalleryAttrs {
  images?: GalleryImage[]
  columns?: 2 | 3 | 4
  gap?: 'small' | 'medium' | 'large'
}

function GalleryBlockRenderer({ attrs }: { attrs?: Record<string, unknown> }) {
  const a = (attrs || {}) as GalleryAttrs
  const images = a.images || []
  const columns = a.columns || 3
  const gap = a.gap || 'medium'

  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  }

  const gapClasses = {
    small: 'gap-2',
    medium: 'gap-4',
    large: 'gap-6',
  }

  return (
    <div className={cn(
      'grid my-8',
      columnClasses[columns],
      gapClasses[gap]
    )}>
      {images.map((image, index) => (
        <figure key={index} className="group relative overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.url}
            alt={image.alt || ''}
            className="w-full aspect-square object-cover transition group-hover:scale-105"
          />
          {image.caption && (
            <figcaption className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-sm p-2 opacity-0 group-hover:opacity-100 transition">
              {image.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  )
}

interface VideoAttrs {
  videoUrl?: string
  caption?: string
  autoplay?: boolean
  aspectRatio?: '16:9' | '4:3' | '1:1'
}

function VideoEmbedBlockRenderer({ attrs }: { attrs?: Record<string, unknown> }) {
  const a = (attrs || {}) as VideoAttrs
  const videoUrl = a.videoUrl || ''
  const caption = a.caption || ''
  const autoplay = a.autoplay || false
  const aspectRatio = a.aspectRatio || '16:9'

  const aspectClasses = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square',
  }

  // Extract video ID and platform
  let embedUrl = ''
  
  if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
    const videoId = videoUrl.includes('youtu.be') 
      ? videoUrl.split('/').pop()?.split('?')[0]
      : new URLSearchParams(videoUrl.split('?')[1]).get('v')
    if (videoId) {
      embedUrl = `https://www.youtube.com/embed/${videoId}${autoplay ? '?autoplay=1' : ''}`
    }
  } else if (videoUrl.includes('vimeo.com')) {
    const videoId = videoUrl.split('/').pop()?.split('?')[0]
    if (videoId) {
      embedUrl = `https://player.vimeo.com/video/${videoId}${autoplay ? '?autoplay=1' : ''}`
    }
  }

  if (!embedUrl) {
    return (
      <div className="my-8 p-8 bg-muted rounded-lg text-center text-muted-foreground">
        Invalid video URL
      </div>
    )
  }

  return (
    <figure className="my-8">
      <div className={cn('relative overflow-hidden rounded-lg', aspectClasses[aspectRatio])}>
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      {caption && (
        <figcaption className="text-center text-sm text-muted-foreground mt-2">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

interface CTAAttrs {
  title?: string
  description?: string
  buttonText?: string
  buttonUrl?: string
  backgroundColor?: string
  textColor?: string
  alignment?: 'left' | 'center' | 'right'
}

function CallToActionBlockRenderer({ attrs }: { attrs?: Record<string, unknown> }) {
  const a = (attrs || {}) as CTAAttrs
  const title = a.title || ''
  const description = a.description || ''
  const buttonText = a.buttonText || ''
  const buttonUrl = a.buttonUrl || ''
  const backgroundColor = a.backgroundColor || '#3b82f6'
  const textColor = a.textColor || '#ffffff'
  const alignment = a.alignment || 'center'

  const alignmentClasses = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right',
  }

  return (
    <section
      className={cn(
        'my-8 p-8 md:p-12 rounded-xl flex flex-col',
        alignmentClasses[alignment]
      )}
      style={{ backgroundColor, color: textColor }}
    >
      {title && (
        <h3 className="text-2xl md:text-3xl font-bold mb-4">{title}</h3>
      )}
      {description && (
        <p className="text-lg mb-6 opacity-90 max-w-2xl">{description}</p>
      )}
      {buttonText && buttonUrl && (
        <Link
          href={buttonUrl}
          className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition"
        >
          {buttonText}
        </Link>
      )}
    </section>
  )
}

// ==========================================
// Main Component
// ==========================================

export function TiptapRenderer({ content, className }: TiptapRendererProps) {
  if (!content || !content.content || content.content.length === 0) {
    return null
  }

  // Cast content nodes to TiptapNode[] for rendering
  const nodes = content.content as TiptapNode[]

  return (
    <div className={cn('tiptap-content', className)}>
      {nodes.map((node, index) => renderNode(node, index))}
    </div>
  )
}

export default TiptapRenderer
