'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import { Toolbar } from './Toolbar'
import { BlockPicker } from './BlockPicker'
import { useEffect } from 'react'
import {
    HeroBlock,
    ProductGridBlock,
    TestimonialBlock,
    GalleryBlock,
    VideoEmbedBlock,
    CallToActionBlock,
} from './blocks'

interface RichEditorProps {
    content?: unknown
    onChange?: (content: unknown) => void
    placeholder?: string
    className?: string
    enableBlocks?: boolean
}

export function RichEditor({
    content,
    onChange,
    placeholder = 'Start writing...',
    className = '',
    enableBlocks = false,
}: RichEditorProps) {
    const extensions = [
        StarterKit.configure({
            heading: {
                levels: [1, 2, 3, 4, 5, 6],
            },
        }),
        Placeholder.configure({
            placeholder,
        }),
        Link.configure({
            openOnClick: false,
            HTMLAttributes: {
                class: 'text-blue-600 underline cursor-pointer',
            },
        }),
        Image.configure({
            HTMLAttributes: {
                class: 'max-w-full h-auto rounded-lg',
            },
        }),
        TextAlign.configure({
            types: ['heading', 'paragraph'],
        }),
        Underline,
        TextStyle,
        Color,
        Highlight.configure({
            multicolor: true,
        }),
    ]

    // Add block extensions if enabled
    if (enableBlocks) {
        extensions.push(
            HeroBlock,
            ProductGridBlock,
            TestimonialBlock,
            GalleryBlock,
            VideoEmbedBlock,
            CallToActionBlock,
        )
    }

    const editor = useEditor({
        extensions,
        content: content || '',
        editorProps: {
            attributes: {
                class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4 ${className}`,
            },
        },
        onUpdate: ({ editor }) => {
            if (onChange) {
                onChange(editor.getJSON())
            }
        },
    })

    // Update editor content when content prop changes
    useEffect(() => {
        if (editor && content && JSON.stringify(editor.getJSON()) !== JSON.stringify(content)) {
            editor.commands.setContent(content as Parameters<typeof editor.commands.setContent>[0])
        }
    }, [content, editor])

    return (
        <div className="border rounded-lg overflow-hidden bg-white">
            <div className="flex items-center justify-between border-b">
                <Toolbar editor={editor} />
                {enableBlocks && (
                    <div className="pr-2">
                        <BlockPicker editor={editor} />
                    </div>
                )}
            </div>
            <div className="min-h-[400px]">
                <EditorContent editor={editor} />
            </div>
        </div>
    )
}
