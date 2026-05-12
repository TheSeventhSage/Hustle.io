import { useRef, useEffect, forwardRef } from 'react'
import {
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    List,
    ListOrdered,
    Link as LinkIcon,
    RemoveFormatting,
} from 'lucide-react'

/**
 * RichTextEditor
 * WYSIWYG editor for rich text with formatting toolbar
 */
export const RichTextEditor = forwardRef(function RichTextEditor(
    { value, onChange, error, placeholder = 'Enter description...' },
    ref
) {
    const editorRef = useRef(null)
    const isInitialMount = useRef(true)

    // Initialize content
    useEffect(() => {
        if (editorRef.current && value && isInitialMount.current) {
            editorRef.current.innerHTML = value
            isInitialMount.current = false
        }
    }, [value])

    const handleInput = () => {
        if (editorRef.current) {
            const html = editorRef.current.innerHTML
            onChange(html)
        }
    }

    const execCommand = (command, value = null) => {
        document.execCommand(command, false, value)
        editorRef.current?.focus()
    }

    const insertLink = () => {
        const url = prompt('Enter URL:')
        if (url) {
            execCommand('createLink', url)
        }
    }

    const toolbarButtons = [
        { icon: Bold, command: 'bold', title: 'Bold' },
        { icon: Italic, command: 'italic', title: 'Italic' },
        { icon: Underline, command: 'underline', title: 'Underline' },
        { icon: AlignLeft, command: 'justifyLeft', title: 'Align Left' },
        { icon: AlignCenter, command: 'justifyCenter', title: 'Align Center' },
        { icon: AlignRight, command: 'justifyRight', title: 'Align Right' },
        { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
        { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
        { icon: LinkIcon, command: 'link', title: 'Insert Link', onClick: insertLink },
        { icon: RemoveFormatting, command: 'removeFormat', title: 'Clear Formatting' },
    ]

    return (
        <div className="mb-4">
            <label className="block text-[13px] font-medium text-text-2 dark:text-text-2 mb-1.5">
                Description
            </label>

            {/* Toolbar */}
            <div className={`flex gap-1 p-2 bg-mist dark:bg-surface/50 border ${error ? 'border-error' : 'border-border dark:border-border'} border-b-0 rounded-t-[10px] flex-wrap`}>
                {toolbarButtons.map(({ icon: Icon, command, title, onClick }) => (
                    <button
                        key={command}
                        type="button"
                        onClick={onClick || (() => execCommand(command))}
                        title={title}
                        className="flex items-center justify-center w-8 h-8 bg-white dark:bg-surface border border-border dark:border-border rounded-md cursor-pointer text-text-2 dark:text-text-3 transition-all hover:bg-primary hover:text-white hover:border-primary dark:hover:bg-primary dark:hover:text-white dark:hover:border-primary"
                    >
                        <Icon size={16} />
                    </button>
                ))}
            </div>

            {/* Editor */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                data-placeholder={placeholder}
                className={`min-h-[200px] p-3.5 text-sm text-text-1 dark:text-text-1 bg-white dark:bg-surface border ${error ? 'border-error' : 'border-border dark:border-border'} rounded-b-[10px] outline-none overflow-y-auto leading-relaxed focus:border-primary-sat dark:focus:border-primary-sat rte-content`}
            />

            {error && (
                <p className="text-xs text-error dark:text-error mt-1">
                    {error}
                </p>
            )}

            <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #A0A8A0;
          pointer-events: none;
        }
        .dark [contenteditable][data-placeholder]:empty:before {
          color: #6B7280;
        }
        .rte-content a {
          color: var(--color-primary);
          text-decoration: underline;
        }
        .dark .rte-content a {
          color: var(--color-primary-light);
        }
        .rte-content ul, .rte-content ol {
          margin-left: 20px;
          margin-top: 8px;
          margin-bottom: 8px;
        }
        .rte-content li {
          margin-bottom: 4px;
        }
        .rte-content:focus {
          border-color: var(--color-primary-sat);
        }
        .rte-content:focus + .rte-toolbar {
          border-color: var(--color-primary-sat);
        }
      `}</style>
        </div>
    )
})
