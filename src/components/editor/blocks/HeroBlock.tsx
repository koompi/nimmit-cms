'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewProps } from '@tiptap/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings, Trash2 } from 'lucide-react'

function HeroBlockComponent({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const [isEditing, setIsEditing] = useState(false)
  
  const attrs = node.attrs as {
    imageUrl: string
    title: string
    subtitle: string
    ctaText: string
    ctaUrl: string
    secondaryCtaText: string
    secondaryCtaUrl: string
    alignment: 'left' | 'center' | 'right'
    overlayOpacity: number
  }

  const alignmentClass = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  }[attrs.alignment]

  return (
    <NodeViewWrapper className="my-4">
      <div
        className="relative rounded-lg overflow-hidden min-h-[400px] flex flex-col justify-center p-8"
        style={{
          backgroundImage: attrs.imageUrl ? `url(${attrs.imageUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: attrs.imageUrl ? undefined : '#1f2937',
        }}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: attrs.overlayOpacity / 100 }}
        />

        {/* Content */}
        <div className={`relative z-10 flex flex-col ${alignmentClass} max-w-4xl ${attrs.alignment === 'center' ? 'mx-auto' : ''}`}>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {attrs.title || 'Hero Title'}
          </h1>
          <p className="text-xl text-gray-200 mb-8">
            {attrs.subtitle || 'Add a compelling subtitle here'}
          </p>
          <div className="flex gap-4 flex-wrap">
            {attrs.ctaText && (
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                {attrs.ctaText}
              </Button>
            )}
            {attrs.secondaryCtaText && (
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                {attrs.secondaryCtaText}
              </Button>
            )}
          </div>
        </div>

        {/* Edit Controls */}
        <div className="absolute top-2 right-2 flex gap-2 z-20">
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button size="sm" variant="secondary">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Hero Block</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Background Image URL</Label>
                  <Input
                    value={attrs.imageUrl}
                    onChange={(e) => updateAttributes({ imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={attrs.title}
                    onChange={(e) => updateAttributes({ title: e.target.value })}
                    placeholder="Hero Title"
                  />
                </div>
                <div>
                  <Label>Subtitle</Label>
                  <Input
                    value={attrs.subtitle}
                    onChange={(e) => updateAttributes({ subtitle: e.target.value })}
                    placeholder="Compelling subtitle"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Primary Button Text</Label>
                    <Input
                      value={attrs.ctaText}
                      onChange={(e) => updateAttributes({ ctaText: e.target.value })}
                      placeholder="Get Started"
                    />
                  </div>
                  <div>
                    <Label>Primary Button URL</Label>
                    <Input
                      value={attrs.ctaUrl}
                      onChange={(e) => updateAttributes({ ctaUrl: e.target.value })}
                      placeholder="/contact"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Secondary Button Text</Label>
                    <Input
                      value={attrs.secondaryCtaText}
                      onChange={(e) => updateAttributes({ secondaryCtaText: e.target.value })}
                      placeholder="Learn More"
                    />
                  </div>
                  <div>
                    <Label>Secondary Button URL</Label>
                    <Input
                      value={attrs.secondaryCtaUrl}
                      onChange={(e) => updateAttributes({ secondaryCtaUrl: e.target.value })}
                      placeholder="/about"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Alignment</Label>
                    <Select
                      value={attrs.alignment}
                      onValueChange={(v) => updateAttributes({ alignment: v as 'left' | 'center' | 'right' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Overlay Opacity ({attrs.overlayOpacity}%)</Label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={attrs.overlayOpacity}
                      onChange={(e) => updateAttributes({ overlayOpacity: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button size="sm" variant="destructive" onClick={deleteNode}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </NodeViewWrapper>
  )
}

export const HeroBlock = Node.create({
  name: 'heroBlock',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      imageUrl: { default: '' },
      title: { default: 'Hero Title' },
      subtitle: { default: 'Add a compelling subtitle here' },
      ctaText: { default: 'Get Started' },
      ctaUrl: { default: '#' },
      secondaryCtaText: { default: '' },
      secondaryCtaUrl: { default: '' },
      alignment: { default: 'center' },
      overlayOpacity: { default: 50 },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="hero-block"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'hero-block' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(HeroBlockComponent)
  },
})
