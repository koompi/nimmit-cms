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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings, Trash2, ArrowRight } from 'lucide-react'

function CallToActionBlockComponent({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const [isEditing, setIsEditing] = useState(false)
  
  const attrs = node.attrs as {
    title: string
    description: string
    buttonText: string
    buttonUrl: string
    backgroundColor: string
    textColor: string
    alignment: 'left' | 'center' | 'right'
  }

  const alignmentClass = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  }[attrs.alignment]

  return (
    <NodeViewWrapper className="my-4">
      <div 
        className="relative rounded-xl p-8 md:p-12"
        style={{ backgroundColor: attrs.backgroundColor }}
      >
        <div className={`flex flex-col ${alignmentClass} max-w-2xl ${attrs.alignment === 'center' ? 'mx-auto' : attrs.alignment === 'right' ? 'ml-auto' : ''}`}>
          <h2 
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{ color: attrs.textColor }}
          >
            {attrs.title || 'Call to Action Title'}
          </h2>
          <p 
            className="text-lg mb-6 opacity-90"
            style={{ color: attrs.textColor }}
          >
            {attrs.description || 'Add a compelling description that encourages visitors to take action.'}
          </p>
          {attrs.buttonText && (
            <Button 
              size="lg" 
              className="group"
              style={{ 
                backgroundColor: attrs.textColor, 
                color: attrs.backgroundColor 
              }}
            >
              {attrs.buttonText}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          )}
        </div>

        <div className="absolute top-2 right-2 flex gap-2 z-20">
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button size="sm" variant="secondary">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Call to Action</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input 
                    value={attrs.title}
                    onChange={(e) => updateAttributes({ title: e.target.value })}
                    placeholder="Ready to get started?"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea 
                    value={attrs.description}
                    onChange={(e) => updateAttributes({ description: e.target.value })}
                    placeholder="Describe why they should take action"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Button Text</Label>
                    <Input 
                      value={attrs.buttonText}
                      onChange={(e) => updateAttributes({ buttonText: e.target.value })}
                      placeholder="Get Started"
                    />
                  </div>
                  <div>
                    <Label>Button URL</Label>
                    <Input 
                      value={attrs.buttonUrl}
                      onChange={(e) => updateAttributes({ buttonUrl: e.target.value })}
                      placeholder="/contact"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Background Color</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color"
                        value={attrs.backgroundColor}
                        onChange={(e) => updateAttributes({ backgroundColor: e.target.value })}
                        className="w-12 h-10 p-1"
                      />
                      <Input 
                        value={attrs.backgroundColor}
                        onChange={(e) => updateAttributes({ backgroundColor: e.target.value })}
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Text Color</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color"
                        value={attrs.textColor}
                        onChange={(e) => updateAttributes({ textColor: e.target.value })}
                        className="w-12 h-10 p-1"
                      />
                      <Input 
                        value={attrs.textColor}
                        onChange={(e) => updateAttributes({ textColor: e.target.value })}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                </div>
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

export const CallToActionBlock = Node.create({
  name: 'callToActionBlock',
  group: 'block',
  atom: true,
  draggable: true,
  
  addAttributes() {
    return {
      title: { default: 'Ready to get started?' },
      description: { default: 'Join thousands of satisfied customers and start your journey today.' },
      buttonText: { default: 'Get Started' },
      buttonUrl: { default: '#' },
      backgroundColor: { default: '#3b82f6' },
      textColor: { default: '#ffffff' },
      alignment: { default: 'center' },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="cta-block"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'cta-block' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(CallToActionBlockComponent)
  },
})
