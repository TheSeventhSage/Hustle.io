import { useRef, useState } from 'react'
import { Upload, X, FileIcon } from 'lucide-react'

/**
 * FileUploadComponent
 * Drag-and-drop file upload with previews
 */
export function FileUploadComponent({
    files = [],
    onChange,
    accept = 'image/svg+xml,image/png,image/jpeg,image/gif',
    maxFiles = 10,
    maxSize = 5 * 1024 * 1024, // 5MB
}) {
    const [dragActive, setDragActive] = useState(false)
    const [errors, setErrors] = useState([])
    const inputRef = useRef(null)

    const validateFile = (file) => {
        const acceptedTypes = accept.split(',').map((t) => t.trim())
        const EXTENSION_MIME_MAP = {
            '.pdf': ['application/pdf'],
            '.doc': ['application/msword'],
            '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            '.xls': ['application/vnd.ms-excel'],
            '.xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        }
        const isValidType = acceptedTypes.some((type) => {
            if (type.startsWith('.')) {
                // Extension-based check
                const mimes = EXTENSION_MIME_MAP[type.toLowerCase()]
                if (mimes) return mimes.includes(file.type)
                // Fallback: check filename extension
                return file.name.toLowerCase().endsWith(type.toLowerCase())
            }
            if (type.includes('*')) {
                const baseType = type.split('/')[0]
                return file.type.startsWith(baseType)
            }
            return file.type === type
        })

        if (!isValidType) {
            return `${file.name}: Invalid file type. Accepted: ${accept}`
        }

        if (file.size > maxSize) {
            return `${file.name}: File too large. Max size: ${(maxSize / 1024 / 1024).toFixed(0)}MB`
        }

        return null
    }

    const handleFiles = (newFiles) => {
        const fileArray = Array.from(newFiles)
        const validationErrors = []
        const validFiles = []

        // Check max files limit
        if (files.length + fileArray.length > maxFiles) {
            validationErrors.push(`Maximum ${maxFiles} files allowed`)
            setErrors(validationErrors)
            return
        }

        // Validate each file
        fileArray.forEach((file) => {
            const error = validateFile(file)
            if (error) {
                validationErrors.push(error)
            } else {
                validFiles.push(file)
            }
        })

        setErrors(validationErrors)

        if (validFiles.length > 0) {
            onChange([...files, ...validFiles])
        }
    }

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files)
        }
    }

    const handleChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files)
        }
    }

    const removeFile = (index) => {
        const newFiles = files.filter((_, i) => i !== index)
        onChange(newFiles)
    }

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`
    }

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
                Upload Files
            </label>

            {/* Drop zone */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                style={{
                    padding: '32px',
                    border: `2px dashed ${dragActive ? 'var(--color-primary)' : '#E2E4DD'}`,
                    borderRadius: '10px',
                    background: dragActive ? 'var(--color-mist)' : '#fff',
                    cursor: 'pointer',
                    transition: 'all 200ms',
                    textAlign: 'center',
                }}
            >
                <Upload
                    size={32}
                    style={{
                        color: 'var(--color-text-3)',
                        marginBottom: '12px',
                        display: 'inline-block',
                    }}
                />
                <p
                    style={{
                        fontSize: '14px',
                        color: 'var(--color-text-2)',
                        marginBottom: '4px',
                        fontFamily: 'var(--ff-body)',
                    }}
                >
                    Drag and drop files here, or click to browse
                </p>
                <p
                    style={{
                        fontSize: '12px',
                        color: 'var(--color-text-4)',
                        fontFamily: 'var(--ff-body)',
                    }}
                >
                    Accepted: SVG, PNG, JPG, GIF • Max size: 5MB • Recommended: 800x400px
                </p>
            </div>

            <input
                ref={inputRef}
                type="file"
                multiple
                accept={accept}
                onChange={handleChange}
                style={{ display: 'none' }}
            />

            {/* Errors */}
            {errors.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                    {errors.map((error, i) => (
                        <p
                            key={i}
                            style={{
                                fontSize: '12px',
                                color: 'var(--color-error)',
                                marginBottom: '4px',
                                fontFamily: 'var(--ff-body)',
                            }}
                        >
                            {error}
                        </p>
                    ))}
                </div>
            )}

            {/* File previews */}
            {files.length > 0 && (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                        gap: '12px',
                        marginTop: '16px',
                    }}
                >
                    {files.map((file, index) => {
                        const isImage = file.type.startsWith('image/')
                        const preview = isImage ? URL.createObjectURL(file) : null

                        return (
                            <div
                                key={index}
                                style={{
                                    position: 'relative',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    background: 'var(--color-mist)',
                                }}
                            >
                                {/* Preview */}
                                <div
                                    style={{
                                        width: '100%',
                                        height: '100px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: isImage ? `url(${preview}) center/cover` : 'var(--color-mist)',
                                    }}
                                >
                                    {!isImage && <FileIcon size={32} color="var(--color-text-3)" />}
                                </div>

                                {/* File info */}
                                <div style={{ padding: '8px' }}>
                                    <p
                                        style={{
                                            fontSize: '11px',
                                            fontWeight: 500,
                                            color: 'var(--color-text-2)',
                                            marginBottom: '2px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {file.name}
                                    </p>
                                    <p style={{ fontSize: '10px', color: 'var(--color-text-4)' }}>
                                        {formatFileSize(file.size)}
                                    </p>
                                </div>

                                {/* Remove button */}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        removeFile(index)
                                    }}
                                    aria-label={`Remove ${file.name}`}
                                    style={{
                                        position: 'absolute',
                                        top: '4px',
                                        right: '4px',
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'rgba(0,0,0,0.6)',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        color: '#fff',
                                        transition: 'background 150ms',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(0,0,0,0.8)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(0,0,0,0.6)'
                                    }}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
