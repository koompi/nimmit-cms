'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewProps } from '@tiptap/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Settings, Trash2, Star, Quote } from 'lucide-react'

function TestimonialBlockComponent({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const [isEditing, setIsEditing] = useState(false)
  
  const attrs = node.attrs as {
    quote: string
    authorName: string
    authorTitle: string
    authorImage: string
    rating: number
  }

  return (
    <NodeViewWrapper className="my-4">
      <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8">
        {/* Quote Icon */}
        <Quote className="h-12 w-12 text-blue-200 absolute top-4 left-4" />
        
        <div className="relative z-10">
          {/* Rating */}
          {attrs.rating > 0 && (
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star}
                  className={`h-5 w-5 ${star <= attrs.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
          )}
          
          {/* Quote */}
          <blockquote className="text-xl md:text-2xl font-medium text-gray-800 mb-6 italic">
            &ldquo;{attrs.quote || 'Add your testimonial quote here'}&rdquo;
          </blockquote>
          
          {/* Author */}
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              {attrs.authorImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={attrs.authorImage} 
                  alt={attrs.authorName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xl font-bold text-gray-400">
                  {attrs.authorName?.charAt(0) || '?'}
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {attrs.authorName || 'Author Name'}
              </p>
              <p className="text-gray-600 text-sm">
                {attrs.authorTitle || 'Author Title'}
              </p>
            </div>
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
                <DialogTitle>Edit Testimonial</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Quote</Label>
                  <Textarea 
                    value={attrs.quote}
                    onChange={(e) => updateAttributes({ quote: e.target.value })}
                    placeholder="What did they say about you?"
                    rows={4}
                  />
                </div>
                <div>
                  <Label>Author Name</Label>
                  <Input 
                    value={attrs.authorName}
                    onChange={(e) => updateAttributes({ authorName: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label>Author Title / Company</Label>
                  <Input 
                    value={attrs.authorTitle}
                    onChange={(e) => updateAttributes({ authorTitle: e.target.value })}
                    placeholder="CEO at Company"
                  />
                </div>
                <div>
                  <Label>Author Image URL</Label>
                  <Input 
                    value={attrs.authorImage}
                    onChange={(e) => updateAttributes({ authorImage: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
                <div>
                  <Label>Rating (0-5)</Label>
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => updateAttributes({ rating: star === attrs.rating ? 0 : star })}
                        className="p-1"
                      >
                        <Star 
                          className={`h-6 w-6 ${star <= attrs.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      </button>
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

export const TestimonialBlock = Node.create({
  name: 'testimonialBlock',
  group: 'block',
  atom: true,
  draggable: true,
  
  addAttributes() {
    return {
      quote: { default: '' },
      authorName: { default: '' },
      authorTitle: { default: '' },
      authorImage: { default: '' },
      rating: { default: 5 },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="testimonial-block"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'testimonial-block' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(TestimonialBlockComponent)
  },
})
