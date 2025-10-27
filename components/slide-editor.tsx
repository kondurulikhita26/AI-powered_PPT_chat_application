"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Save, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Slide {
  title: string
  content: string
  layout: string
  imageUrl?: string
  imagePrompt?: string
}

interface SlideEditorProps {
  slide: Slide | null
  slideIndex: number | null
  isOpen: boolean
  onClose: () => void
  onSave: (updatedSlide: Slide) => void
}

export default function SlideEditor({ slide, slideIndex, isOpen, onClose, onSave }: SlideEditorProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [layout, setLayout] = useState("title-content")
  const [imageUrl, setImageUrl] = useState("")
  const [imagePrompt, setImagePrompt] = useState("")

  // Update form when slide changes
  const handleOpenChange = (open: boolean) => {
    if (open && slide) {
      setTitle(slide.title)
      setContent(slide.content)
      setLayout(slide.layout)
      setImageUrl(slide.imageUrl || "")
      setImagePrompt(slide.imagePrompt || "")
    } else if (!open) {
      setTitle("")
      setContent("")
      setLayout("title-content")
      setImageUrl("")
      setImagePrompt("")
    }
    if (!open) onClose()
  }

  const handleSave = () => {
    onSave({
      title,
      content,
      layout,
      imageUrl: imageUrl || undefined,
      imagePrompt: imagePrompt || undefined,
    })
    handleOpenChange(false)
  }

  const handleRemoveImage = () => {
    setImageUrl("")
    setImagePrompt("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Slide {slideIndex !== null ? slideIndex + 1 : ""}</DialogTitle>
          <DialogDescription>Make changes to your slide content</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Slide Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter slide title"
              className="bg-card border-border"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Content</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter slide content (use bullet points with • or -)"
              className="bg-card border-border min-h-32"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Layout</label>
            <select
              value={layout}
              onChange={(e) => setLayout(e.target.value)}
              className="w-full px-3 py-2 bg-card border border-border rounded-md text-foreground text-sm"
            >
              <option value="title-content">Title + Content</option>
              <option value="title-only">Title Only</option>
              <option value="content-only">Content Only</option>
            </select>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-medium text-foreground mb-3">Slide Image</h3>

            {imageUrl && (
              <div className="mb-4">
                <img
                  src={imageUrl || "/placeholder.svg"}
                  alt="Slide preview"
                  className="w-full h-40 object-cover rounded-md border border-border"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="mt-2 w-full gap-2 border-border bg-transparent text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove Image
                </Button>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Image Prompt</label>
              <Textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="Describe the image you want (e.g., 'A modern office with people working on computers')"
                className="bg-card border-border min-h-20"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Images are generated automatically when you create slides. Edit the prompt to regenerate.
              </p>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
