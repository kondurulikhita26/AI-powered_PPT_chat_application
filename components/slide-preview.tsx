"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import SlideEditor from "./slide-editor"

interface Slide {
  title: string
  content: string
  layout: string
  imageUrl?: string
  imagePrompt?: string
}

interface SlidePreviewProps {
  slides: Slide[]
  onSlideUpdate?: (index: number, updatedSlide: Slide) => void
}

export default function SlidePreview({ slides, onSlideUpdate }: SlidePreviewProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)

  if (slides.length === 0) return null

  const slide = slides[currentSlide]

  const handlePrevious = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : slides.length - 1))
  }

  const handleNext = () => {
    setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : 0))
  }

  const handleEditSlide = () => {
    setEditingSlide(slide)
    setEditingIndex(currentSlide)
    setIsEditorOpen(true)
  }

  const handleSaveSlide = (updatedSlide: Slide) => {
    if (editingIndex !== null && onSlideUpdate) {
      onSlideUpdate(editingIndex, updatedSlide)
    }
    setIsEditorOpen(false)
    setEditingSlide(null)
    setEditingIndex(null)
  }

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex-1 p-4 flex items-center justify-center overflow-auto">
          <div className="w-full aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg border border-border p-6 flex flex-col justify-between shadow-sm">
            {slide.imageUrl && (
              <div className="mb-4 flex-shrink-0">
                <img
                  src={slide.imageUrl || "/placeholder.svg"}
                  alt={slide.title}
                  className="w-full h-32 object-cover rounded-md"
                />
              </div>
            )}

            <div className="flex-1 overflow-auto">
              <h2 className="text-2xl font-bold text-foreground mb-4">{slide.title}</h2>
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{slide.content}</p>
            </div>

            <div className="text-xs text-muted-foreground mt-4">Layout: {slide.layout}</div>
          </div>
        </div>

        <div className="border-t border-border p-4 space-y-3 bg-muted/20">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={handlePrevious} className="border-border bg-transparent">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground font-medium">
              Slide {currentSlide + 1} of {slides.length}
            </span>
            <Button variant="outline" size="sm" onClick={handleNext} className="border-border bg-transparent">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleEditSlide}
            className="w-full border-border bg-transparent gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit Slide
          </Button>

          {/* Slide Thumbnails */}
          <div className="flex gap-2 overflow-x-auto">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`flex-shrink-0 w-12 h-12 rounded border-2 transition-colors font-semibold text-xs ${
                  index === currentSlide
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50 text-muted-foreground"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isEditorOpen && (
        <SlideEditor
          slide={editingSlide}
          slideIndex={editingIndex}
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSave={handleSaveSlide}
        />
      )}
    </>
  )
}
