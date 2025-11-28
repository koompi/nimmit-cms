'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewProps } from '@tiptap/react'
import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings, Trash2, Play } from 'lucide-react'

function getVideoEmbedUrl(url: string): { embedUrl: string; platform: string } | null {
  // YouTube
  const youtubeRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  const youtubeMatch = url.match(youtubeRegex)
  if (youtubeMatch) {
    return {
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
      platform: 'youtube'
    }
  }

  // Vimeo
  const vimeoRegex = /(?:vimeo\.com\/)(\d+)/
  const vimeoMatch = url.match(vimeoRegex)
  if (vimeoMatch) {
    return {
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      platform: 'vimeo'
    }
  }

  return null
}

function VideoEmbedBlockComponent({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const [isEditing, setIsEditing] = useState(false)
  
  const attrs = node.attrs as {
    videoUrl: string
    caption: string
    autoplay: boolean
    aspectRatio: '16:9' | '4:3' | '1:1'
  }

  const aspectRatioClass = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square',
  }[attrs.aspectRatio]

  const videoEmbed = useMemo(() => {
    if (!attrs.videoUrl) return null
    return getVideoEmbedUrl(attrs.videoUrl)
  }, [attrs.videoUrl])

  return (
    <NodeViewWrapper className="my-4">
      <div className="relative">
        {/* Video Embed */}
        <div className={`bg-gray-900 rounded-lg overflow-hidden ${aspectRatioClass}`}>
          {videoEmbed ? (
            <iframe
              src={`${videoEmbed.embedUrl}${attrs.autoplay ? '?autoplay=1' : ''}`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
              <Play className="h-16 w-16 mb-4" />
              <p className="text-center">
                {attrs.videoUrl 
                  ? 'Invalid video URL. Use YouTube or Vimeo links.' 
                  : 'No video URL set. Click settings to add one.'}
              </p>
            </div>
          )}
        </div>
        
        {/* Caption */}
        {attrs.caption && (
          <p className="text-center text-gray-600 text-sm mt-2 italic">{attrs.caption}</p>
        )}

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
                <DialogTitle>Edit Video</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Video URL</Label>
                  <Input 
                    value={attrs.videoUrl}
                    onChange={(e) => updateAttributes({ videoUrl: e.target.value })}
                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supports YouTube and Vimeo links
                  </p>
                </div>
                <div>
                  <Label>Caption (optional)</Label>
                  <Input 
                    value={attrs.caption}
                    onChange={(e) => updateAttributes({ caption: e.target.value })}
                    placeholder="Video description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Aspect Ratio</Label>
                    <Select 
                      value={attrs.aspectRatio} 
                      onValueChange={(v) => updateAttributes({ aspectRatio: v as '16:9' | '4:3' | '1:1' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                        <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                        <SelectItem value="1:1">1:1 (Square)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="autoplay"
                        checked={attrs.autoplay}
                        onCheckedChange={(checked: boolean) => updateAttributes({ autoplay: !!checked })}
                      />
                      <Label htmlFor="autoplay">Autoplay</Label>
                    </div>
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

export const VideoEmbedBlock = Node.create({
  name: 'videoEmbedBlock',
  group: 'block',
  atom: true,
  draggable: true,
  
  addAttributes() {
    return {
      videoUrl: { default: '' },
      caption: { default: '' },
      autoplay: { default: false },
      aspectRatio: { default: '16:9' },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="video-embed-block"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'video-embed-block' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoEmbedBlockComponent)
  },
})
