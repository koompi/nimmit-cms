'use client'

import { Editor } from '@tiptap/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Plus, 
  Layout, 
  Package, 
  Quote, 
  Image, 
  Video, 
  Megaphone 
} from 'lucide-react'

interface BlockPickerProps {
  editor: Editor | null
}

interface BlockOption {
  type: string
  name: string
  description: string
  icon: React.ReactNode
  insert: (editor: Editor) => void
}

const blocks: BlockOption[] = [
  {
    type: 'heroBlock',
    name: 'Hero Section',
    description: 'Full-width hero with image, title, and CTA buttons',
    icon: <Layout className="h-6 w-6" />,
    insert: (editor) => {
      editor.chain().focus().insertContent({
        type: 'heroBlock',
        attrs: {
          imageUrl: '',
          title: 'Hero Title',
          subtitle: 'Add a compelling subtitle here',
          ctaText: 'Get Started',
          ctaUrl: '#',
          alignment: 'center',
          overlayOpacity: 50,
        },
      }).run()
    },
  },
  {
    type: 'productGridBlock',
    name: 'Product Grid',
    description: 'Display a grid of selected products',
    icon: <Package className="h-6 w-6" />,
    insert: (editor) => {
      editor.chain().focus().insertContent({
        type: 'productGridBlock',
        attrs: {
          title: 'Featured Products',
          productIds: [],
          columns: 3,
          showPrice: true,
          showDescription: true,
        },
      }).run()
    },
  },
  {
    type: 'testimonialBlock',
    name: 'Testimonial',
    description: 'Customer quote with author info and rating',
    icon: <Quote className="h-6 w-6" />,
    insert: (editor) => {
      editor.chain().focus().insertContent({
        type: 'testimonialBlock',
        attrs: {
          quote: '',
          authorName: '',
          authorTitle: '',
          authorImage: '',
          rating: 5,
        },
      }).run()
    },
  },
  {
    type: 'galleryBlock',
    name: 'Image Gallery',
    description: 'Grid of images with optional lightbox',
    icon: <Image className="h-6 w-6" />,
    insert: (editor) => {
      editor.chain().focus().insertContent({
        type: 'galleryBlock',
        attrs: {
          images: [],
          columns: 3,
          gap: 'medium',
          lightbox: true,
        },
      }).run()
    },
  },
  {
    type: 'videoEmbedBlock',
    name: 'Video Embed',
    description: 'Embed YouTube or Vimeo videos',
    icon: <Video className="h-6 w-6" />,
    insert: (editor) => {
      editor.chain().focus().insertContent({
        type: 'videoEmbedBlock',
        attrs: {
          videoUrl: '',
          caption: '',
          autoplay: false,
          aspectRatio: '16:9',
        },
      }).run()
    },
  },
  {
    type: 'callToActionBlock',
    name: 'Call to Action',
    description: 'Highlighted section with button',
    icon: <Megaphone className="h-6 w-6" />,
    insert: (editor) => {
      editor.chain().focus().insertContent({
        type: 'callToActionBlock',
        attrs: {
          title: 'Ready to get started?',
          description: 'Join thousands of satisfied customers and start your journey today.',
          buttonText: 'Get Started',
          buttonUrl: '#',
          backgroundColor: '#3b82f6',
          textColor: '#ffffff',
          alignment: 'center',
        },
      }).run()
    },
  },
]

export function BlockPicker({ editor }: BlockPickerProps) {
  const [open, setOpen] = useState(false)

  if (!editor) return null

  const handleInsert = (block: BlockOption) => {
    block.insert(editor)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Block
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Insert Block</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {blocks.map((block) => (
            <button
              key={block.type}
              onClick={() => handleInsert(block)}
              className="flex flex-col items-center p-4 rounded-lg border hover:border-blue-500 hover:bg-blue-50 transition-colors text-center group"
            >
              <div className="p-3 rounded-full bg-gray-100 group-hover:bg-blue-100 mb-3">
                {block.icon}
              </div>
              <h3 className="font-medium text-sm">{block.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{block.description}</p>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
