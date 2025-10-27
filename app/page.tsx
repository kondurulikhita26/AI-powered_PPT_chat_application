"use client"

import { useState, useRef, useEffect } from "react"
import ChatInterface from "@/components/chat-interface"
import SlidePreview from "@/components/slide-preview"
import { Button } from "@/components/ui/button"
import { Menu, X, Save, Trash2, Plus, Settings, LogOut, FileText, Share2, Clock } from "lucide-react"
import { usePresentationHistory } from "@/hooks/use-presentation-history"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import ExportMenu from "@/components/export-menu"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface Slide {
  title: string
  content: string
  layout: string
  imageUrl?: string
  imagePrompt?: string
}

export default function PresentationApp() {
  const [messages, setMessages] = useState<Message[]>([])
  const [slides, setSlides] = useState<Slide[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentPresentationId, setCurrentPresentationId] = useState<string | null>(null)
  const [presentationName, setPresentationName] = useState("Untitled Presentation")
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveName, setSaveName] = useState("")
  const [showHistoryPanel, setShowHistoryPanel] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { presentations, isLoaded, savePresentation, deletePresentation, getPresentation, updatePresentation } =
    usePresentationHistory()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-save is now handled only when explicitly saving or loading presentations

  const handleSendMessage = async (message: string, slideCount = 5) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch("/api/generate-slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: message,
          previousSlides: slides,
          slideCount: slideCount,
        }),
      })

      const data = await response.json()

      if (data.slides) {
        setSlides(data.slides)
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message || "Slides generated successfully!",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error generating slides:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, there was an error generating the slides. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSlideUpdate = (index: number, updatedSlide: Slide) => {
    setSlides((prev) => {
      const newSlides = [...prev]
      newSlides[index] = updatedSlide
      return newSlides
    })
  }

  const handleDownloadPPT = async () => {
    try {
      const response = await fetch("/api/download-ppt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides }),
      })

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${presentationName}.pptx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading PPT:", error)
    }
  }

  const handleSavePresentation = () => {
    if (saveName.trim()) {
      const id = savePresentation(saveName, messages, slides)
      setPresentationName(saveName)
      setCurrentPresentationId(id)
      setSaveName("")
      setShowSaveDialog(false)
    }
  }

  const handleLoadPresentation = (id: string) => {
    const presentation = getPresentation(id)
    if (presentation) {
      setMessages(presentation.messages)
      setSlides(presentation.slides)
      setPresentationName(presentation.name)
      setCurrentPresentationId(id)
      setShowHistoryPanel(false)
    }
  }

  const handleNewPresentation = () => {
    if ((messages.length > 0 || slides.length > 0) && currentPresentationId === null) {
      const autoSaveName =
        presentationName === "Untitled Presentation" ? `Presentation ${new Date().toLocaleString()}` : presentationName
      savePresentation(autoSaveName, messages, slides)
    }

    // Clear for new presentation
    setMessages([])
    setSlides([])
    setPresentationName("Untitled Presentation")
    setCurrentPresentationId(null)
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className="w-20 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-4 gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-sidebar-foreground hover:bg-sidebar-accent rounded-lg"
          onClick={handleNewPresentation}
          title="New Presentation"
        >
          <Plus className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-sidebar-foreground hover:bg-sidebar-accent rounded-lg"
          title="Home"
        >
          <FileText className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-sidebar-foreground hover:bg-sidebar-accent rounded-lg"
          onClick={() => setShowHistoryPanel(!showHistoryPanel)}
          title="Presentation History"
        >
          <Clock className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-sidebar-foreground hover:bg-sidebar-accent rounded-lg"
          title="Share"
        >
          <Share2 className="w-5 h-5" />
        </Button>

        <div className="flex-1" />

        <Button
          variant="ghost"
          size="icon"
          className="text-sidebar-foreground hover:bg-sidebar-accent rounded-lg"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-sidebar-foreground hover:bg-sidebar-accent rounded-lg"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>

      <div
        className={`${
          showHistoryPanel ? "w-80" : "w-0"
        } bg-card border-r border-border transition-all duration-300 overflow-hidden flex flex-col`}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Presentation History</h2>
          <Button variant="ghost" size="icon" onClick={() => setShowHistoryPanel(false)} className="h-6 w-6">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-2">
            {isLoaded && presentations.length > 0 ? (
              presentations.map((presentation) => (
                <div
                  key={presentation.id}
                  className={`flex flex-col gap-1 p-3 rounded-lg border transition-all cursor-pointer ${
                    currentPresentationId === presentation.id
                      ? "bg-primary/10 border-primary"
                      : "border-border hover:bg-muted"
                  } group`}
                >
                  <button onClick={() => handleLoadPresentation(presentation.id)} className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground truncate">{presentation.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {presentation.slides.length} slides • {presentation.messages.length} messages
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(presentation.updatedAt).toLocaleDateString()}
                    </p>
                  </button>
                  <button
                    onClick={() => deletePresentation(presentation.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity self-end"
                  >
                    <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">No presentations yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } bg-card border-r border-border transition-all duration-300 overflow-hidden flex flex-col`}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Recent</h2>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="h-6 w-6">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-2">
            {isLoaded && presentations.length > 0 ? (
              presentations.slice(0, 10).map((presentation) => (
                <div
                  key={presentation.id}
                  className="flex items-center gap-2 p-2 rounded hover:bg-primary/10 group transition-colors"
                >
                  <button
                    onClick={() => handleLoadPresentation(presentation.id)}
                    className="flex-1 text-left text-sm font-medium text-primary hover:text-primary/80 truncate transition-colors"
                    title={presentation.name}
                  >
                    {presentation.name}
                  </button>
                  <button
                    onClick={() => deletePresentation(presentation.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">No recent presentations</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="h-8 w-8">
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
            <h1 className="text-lg font-semibold text-foreground">{presentationName}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Save className="w-4 h-4" />
                  Save
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Presentation</DialogTitle>
                  <DialogDescription>Enter a name for your presentation</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Presentation name"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSavePresentation()
                      }
                    }}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSavePresentation}>Save</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {slides.length > 0 && (
              <ExportMenu
                presentationName={presentationName}
                messages={messages}
                slides={slides}
                onDownloadPPT={handleDownloadPPT}
              />
            )}
          </div>
        </div>

        <div className="flex-1 flex gap-4 overflow-hidden p-4">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-card rounded-lg border border-border overflow-hidden shadow-sm">
            <ChatInterface
              messages={messages}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
              messagesEndRef={messagesEndRef}
            />
          </div>

          {/* Preview Area */}
          <div className="w-96 flex flex-col bg-card rounded-lg border border-border overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <h3 className="font-semibold text-sm text-foreground">Preview</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              {slides.length > 0 ? (
                <SlidePreview slides={slides} onSlideUpdate={handleSlideUpdate} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p className="text-center text-sm">Start by entering a prompt to generate slides</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
