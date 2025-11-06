import { useRef, useState } from 'react'
import { CONFIG } from '../config'
import { EXAMPLE_PORTRAITS } from '../lib/examplePortraits'
import './Upload.css'

interface UploadProps {
  onImageUpload: (image: HTMLImageElement) => void
}

/**
 * Upload component with drag-and-drop support
 * Resizes images to max width specified in config
 */
export default function Upload({ onImageUpload }: UploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * Resize image to max width while maintaining aspect ratio
   */
  const resizeImage = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
          }

          let { width, height } = img
          if (width > CONFIG.maxImageWidth) {
            height = (height * CONFIG.maxImageWidth) / width
            width = CONFIG.maxImageWidth
          }

          canvas.width = width
          canvas.height = height
          ctx.drawImage(img, 0, 0, width, height)

          const resizedImg = new Image()
          resizedImg.onload = () => resolve(resizedImg)
          resizedImg.onerror = () => reject(new Error('Failed to create resized image'))
          resizedImg.src = canvas.toDataURL('image/jpeg', 0.9)
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    try {
      const image = await resizeImage(file)
      onImageUpload(image)
    } catch (error) {
      console.error('Error processing image:', error)
      alert('Failed to process image. Please try again.')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  /**
   * Load and use an example portrait image from URL
   * Applies same resizing logic as file upload
   */
  const handleExampleLoad = async (imageUrl: string) => {
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('Failed to load example image'))
        img.src = imageUrl
      })

      // Apply same resizing logic as file upload
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Could not get canvas context')
      }

      let { width, height } = img
      if (width > CONFIG.maxImageWidth) {
        height = (height * CONFIG.maxImageWidth) / width
        width = CONFIG.maxImageWidth
      }

      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)

      const resizedImg = new Image()
      await new Promise<void>((resolve, reject) => {
        resizedImg.onload = () => resolve()
        resizedImg.onerror = () => reject(new Error('Failed to create resized image'))
        resizedImg.src = canvas.toDataURL('image/jpeg', 0.9)
      })

      onImageUpload(resizedImg)
    } catch (error) {
      console.error('Error loading example image:', error)
      alert('Failed to load example image. Please try again.')
    }
  }

  return (
    <div className="upload-container">
      <div
        className={`upload-dropzone ${isDragging ? 'dragging' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
        <div className="upload-content">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <h2>Upload a Portrait</h2>
          <p>Drag and drop an image here, or click to select</p>
          <p className="upload-hint">Supports JPG, PNG, and WebP (max {CONFIG.maxImageWidth}px width)</p>
        </div>
      </div>
      <div className="example-portraits-section">
        <p className="example-portraits-callout">Or try one of these images...</p>
        <div className="example-portraits-grid">
          {EXAMPLE_PORTRAITS.map((portrait, index) => (
            <button
              key={index}
              className="example-portrait-card"
              onClick={(e) => {
                e.stopPropagation()
                handleExampleLoad(portrait.url)
              }}
              title={portrait.photographer ? `Photo by ${portrait.photographer}` : portrait.name}
            >
              <img
                src={portrait.url}
                alt={portrait.name}
                className="example-portrait-image"
                crossOrigin="anonymous"
              />
              <div className="example-portrait-overlay">
                <span className="example-portrait-name">{portrait.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

