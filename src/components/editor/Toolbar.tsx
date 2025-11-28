'use client'

import { Editor } from '@tiptap/react'
import {
    FaBold,
    FaItalic,
    FaUnderline,
    FaStrikethrough,
    FaCode,
    FaHeading,
    FaListUl,
    FaListOl,
    FaQuoteRight,
    FaUndo,
    FaRedo,
    FaLink,
    FaAlignLeft,
    FaAlignCenter,
    FaAlignRight,
    FaAlignJustify,
} from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface ToolbarProps {
    editor: Editor | null
}

export function Toolbar({ editor }: ToolbarProps) {
    const [showLinkInput, setShowLinkInput] = useState(false)
    const [linkUrl, setLinkUrl] = useState('')

    if (!editor) {
        return null
    }

    const addLink = () => {
        if (linkUrl) {
            editor.chain().focus().setLink({ href: linkUrl }).run()
            setLinkUrl('')
            setShowLinkInput(false)
        }
    }

    const removeLink = () => {
        editor.chain().focus().unsetLink().run()
    }

    const ToolbarButton = ({
        onClick,
        active,
        children,
        title,
    }: {
        onClick: () => void
        active?: boolean
        children: React.ReactNode
        title: string
    }) => (
        <Button
            type="button"
            variant={active ? 'default' : 'ghost'}
            size="sm"
            onClick={onClick}
            title={title}
            className="h-8 w-8 p-0"
        >
            {children}
        </Button>
    )

    return (
        <div className="border-b bg-gray-50 p-2 flex flex-wrap gap-1 items-center sticky top-0 z-10">
            {/* Text Formatting */}
            <div className="flex gap-1 pr-2 border-r">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive('bold')}
                    title="Bold"
                >
                    <FaBold className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive('italic')}
                    title="Italic"
                >
                    <FaItalic className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    active={editor.isActive('underline')}
                    title="Underline"
                >
                    <FaUnderline className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    active={editor.isActive('strike')}
                    title="Strikethrough"
                >
                    <FaStrikethrough className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    active={editor.isActive('code')}
                    title="Inline Code"
                >
                    <FaCode className="h-4 w-4" />
                </ToolbarButton>
            </div>

            {/* Headings */}
            <div className="flex gap-1 pr-2 border-r">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    active={editor.isActive('heading', { level: 1 })}
                    title="Heading 1"
                >
                    <FaHeading className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    active={editor.isActive('heading', { level: 2 })}
                    title="Heading 2"
                >
                    <FaHeading className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    active={editor.isActive('heading', { level: 3 })}
                    title="Heading 3"
                >
                    <FaHeading className="h-4 w-4" />
                </ToolbarButton>
            </div>

            {/* Lists */}
            <div className="flex gap-1 pr-2 border-r">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive('bulletList')}
                    title="Bullet List"
                >
                    <FaListUl className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    active={editor.isActive('orderedList')}
                    title="Numbered List"
                >
                    <FaListOl className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    active={editor.isActive('blockquote')}
                    title="Blockquote"
                >
                    <FaQuoteRight className="h-4 w-4" />
                </ToolbarButton>
            </div>

            {/* Alignment */}
            <div className="flex gap-1 pr-2 border-r">
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    active={editor.isActive({ textAlign: 'left' })}
                    title="Align Left"
                >
                    <FaAlignLeft className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    active={editor.isActive({ textAlign: 'center' })}
                    title="Align Center"
                >
                    <FaAlignCenter className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    active={editor.isActive({ textAlign: 'right' })}
                    title="Align Right"
                >
                    <FaAlignRight className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    active={editor.isActive({ textAlign: 'justify' })}
                    title="Justify"
                >
                    <FaAlignJustify className="h-4 w-4" />
                </ToolbarButton>
            </div>

            {/* Link */}
            <div className="flex gap-1 pr-2 border-r items-center">
                {!showLinkInput ? (
                    <>
                        <ToolbarButton
                            onClick={() => {
                                if (editor.isActive('link')) {
                                    removeLink()
                                } else {
                                    setShowLinkInput(true)
                                    setLinkUrl(editor.getAttributes('link').href || '')
                                }
                            }}
                            active={editor.isActive('link')}
                            title="Link"
                        >
                            <FaLink className="h-4 w-4" />
                        </ToolbarButton>
                    </>
                ) : (
                    <div className="flex gap-1 items-center">
                        <input
                            type="url"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    addLink()
                                } else if (e.key === 'Escape') {
                                    setShowLinkInput(false)
                                    setLinkUrl('')
                                }
                            }}
                            placeholder="Enter URL"
                            className="px-2 py-1 text-sm border rounded w-48"
                            autoFocus
                        />
                        <Button
                            type="button"
                            size="sm"
                            onClick={addLink}
                            className="h-8"
                        >
                            Add
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                                setShowLinkInput(false)
                                setLinkUrl('')
                            }}
                            className="h-8"
                        >
                            Cancel
                        </Button>
                    </div>
                )}
            </div>

            {/* Undo/Redo */}
            <div className="flex gap-1">
                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    title="Undo"
                >
                    <FaUndo className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    title="Redo"
                >
                    <FaRedo className="h-4 w-4" />
                </ToolbarButton>
            </div>
        </div>
    )
}
