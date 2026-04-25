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
        <div style={{ marginBottom: '16px' }}>
            <label
                style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'var(--color-text-2)',
                    marginBottom: '6px',
                    fontFamily: 'var(--ff-body)',
                }}
            >
                Description
            </label>

            {/* Toolbar */}
            <div
                style={{
                    display: 'flex',
                    gap: '4px',
                    padding: '8px',
                    background: 'var(--color-mist)',
                    border: `1px solid ${error ? 'var(--color-error)' : '#E2E4DD'}`,
                    borderBottom: 'none',
                    borderRadius: '10px 10px 0 0',
                    flexWrap: 'wrap',
                }}
            >
                {toolbarButtons.map(({ icon: Icon, command, title, onClick }) => (
                    <button
                        key={command}
                        type="button"
                        onClick={onClick || (() => execCommand(command))}
                        title={title}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            background: '#fff',
                            border: '1px solid #E2E4DD',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: 'var(--color-text-2)',
                            transition: 'all 150ms',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--color-primary)'
                            e.currentTarget.style.color = '#fff'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#fff'
                            e.currentTarget.style.color = 'var(--color-text-2)'
                        }}
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
                style={{
                    minHeight: '200px',
                    padding: '14px',
                    fontSize: '14px',
                    fontFamily: 'var(--ff-body)',
                    color: 'var(--color-text-1)',
                    background: '#fff',
                    border: `1px solid ${error ? 'var(--color-error)' : '#E2E4DD'}`,
                    borderRadius: '0 0 10px 10px',
                    outline: 'none',
                    overflowY: 'auto',
                    lineHeight: '1.6',
                }}
                onFocus={(e) => {
                    if (!error) {
                        e.currentTarget.style.borderColor = 'var(--color-primary-sat)'
                        e.currentTarget.previousElementSibling.style.borderColor = 'var(--color-primary-sat)'
                    }
                }}
                onBlur={(e) => {
                    e.currentTarget.style.borderColor = error ? 'var(--color-error)' : '#E2E4DD'
                    e.currentTarget.previousElementSibling.style.borderColor = error ? 'var(--color-error)' : '#E2E4DD'
                }}
            />

            {error && (
                <p
                    style={{
                        fontSize: '12px',
                        color: 'var(--color-error)',
                        marginTop: '4px',
                        fontFamily: 'var(--ff-body)',
                    }}
                >
                    {error}
                </p>
            )}

            <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #A0A8A0;
          pointer-events: none;
        }
        [contenteditable] a {
          color: var(--color-primary);
          text-decoration: underline;
        }
        [contenteditable] ul, [contenteditable] ol {
          margin-left: 20px;
          margin-top: 8px;
          margin-bottom: 8px;
        }
        [contenteditable] li {
          margin-bottom: 4px;
        }
      `}</style>
        </div>
    )
})
