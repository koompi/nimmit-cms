'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewProps } from '@tiptap/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings, Trash2, Plus, X, ImageIcon, ZoomIn } from 'lucide-react'

interface GalleryImage {
  url: string
  alt: string
  caption?: string
}

function GalleryBlockComponent({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null)
  
  const attrs = node.attrs as {
    images: GalleryImage[]
    columns: 2 | 3 | 4
    gap: 'small' | 'medium' | 'large'
    lightbox: boolean
  }

  const gridColsClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }[attrs.columns]

  const gapClass = {
    small: 'gap-2',
    medium: 'gap-4',
    large: 'gap-6',
  }[attrs.gap]

  const addImage = () => {
    updateAttributes({
      images: [...attrs.images, { url: '', alt: '', caption: '' }]
    })
  }

  const removeImage = (index: number) => {
    const newImages = attrs.images.filter((_, i) => i !== index)
    updateAttributes({ images: newImages })
  }

  const updateImage = (index: number, field: keyof GalleryImage, value: string) => {
    const newImages = [...attrs.images]
    newImages[index] = { ...newImages[index], [field]: value }
    updateAttributes({ images: newImages })
  }

  return (
    <NodeViewWrapper className="my-4">
      <div className="relative bg-white rounded-lg p-4">
        {/* Gallery Grid */}
        {attrs.images.length > 0 ? (
          <div className={`grid ${gridColsClass} ${gapClass}`}>
            {attrs.images.map((image, index) => (
              <div
                key={index}
                className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => attrs.lightbox && setLightboxImage(image)}
              >
                {image.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image.url}
                    alt={image.alt || 'Gallery image'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-gray-300" />
                  </div>
                )}
                {attrs.lightbox && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ZoomIn className="h-8 w-8 text-white" />
                  </div>
                )}
                {image.caption && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 p-2">
                    <p className="text-white text-sm">{image.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No images added. Click settings to add images.</p>
          </div>
        )}

        {/* Lightbox Modal */}
        {lightboxImage && (
          <Dialog open={!!lightboxImage} onOpenChange={() => setLightboxImage(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{lightboxImage.alt || 'Image'}</DialogTitle>
                {lightboxImage.caption && (
                  <DialogDescription>{lightboxImage.caption}</DialogDescription>
                )}
              </DialogHeader>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightboxImage.url}
                alt={lightboxImage.alt || 'Gallery image'}
                className="w-full h-auto rounded-lg"
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Edit Controls */}
        <div className="absolute top-2 right-2 flex gap-2 z-20">
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button size="sm" variant="secondary">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>Edit Gallery</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Columns</Label>
                    <Select
                      value={attrs.columns.toString()}
                      onValueChange={(v) => updateAttributes({ columns: parseInt(v) as 2 | 3 | 4 })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Gap</Label>
                    <Select
                      value={attrs.gap}
                      onValueChange={(v) => updateAttributes({ gap: v as 'small' | 'medium' | 'large' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="lightbox"
                        checked={attrs.lightbox}
                        onCheckedChange={(checked: boolean) => updateAttributes({ lightbox: !!checked })}
                      />
                      <Label htmlFor="lightbox">Lightbox</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Images</Label>
                    <Button type="button" size="sm" onClick={addImage}>
                      <Plus className="h-4 w-4 mr-1" /> Add Image
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {attrs.images.map((image, index) => (
                      <div key={index} className="border rounded-lg p-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Image {index + 1}</span>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          value={image.url}
                          onChange={(e) => updateImage(index, 'url', e.target.value)}
                          placeholder="Image URL"
                        />
                        <Input
                          value={image.alt}
                          onChange={(e) => updateImage(index, 'alt', e.target.value)}
                          placeholder="Alt text"
                        />
                        <Input
                          value={image.caption || ''}
                          onChange={(e) => updateImage(index, 'caption', e.target.value)}
                          placeholder="Caption (optional)"
                        />
                      </div>
                    ))}
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

export const GalleryBlock = Node.create({
  name: 'galleryBlock',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      images: { default: [] },
      columns: { default: 3 },
      gap: { default: 'medium' },
      lightbox: { default: true },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="gallery-block"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'gallery-block' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(GalleryBlockComponent)
  },
})
