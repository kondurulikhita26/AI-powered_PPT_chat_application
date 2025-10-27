"use client"

import type React from "react"

import { useState, type RefObject } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2 } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatInterfaceProps {
  messages: Message[]
  isLoading: boolean
  onSendMessage: (message: string, slideCount: number) => void
  messagesEndRef: RefObject<HTMLDivElement>
}

export default function ChatInterface({ messages, isLoading, onSendMessage, messagesEndRef }: ChatInterfaceProps) {
  const [input, setInput] = useState("")
  const [slideCount, setSlideCount] = useState(5)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSendMessage(input, slideCount)
      setInput("")
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-2 text-foreground">Start with a topic</h3>
              <p className="text-muted-foreground max-w-xs">
                Describe your presentation topic and let AI create beautiful slides for you
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted text-muted-foreground rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted text-muted-foreground px-4 py-3 rounded-lg rounded-bl-none">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Generating slides...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="border-t border-border p-4 bg-muted/20 space-y-3">
        <div className="flex items-center gap-2">
          <label htmlFor="slideCount" className="text-sm text-muted-foreground whitespace-nowrap">
            Slides:
          </label>
          <Input
            id="slideCount"
            type="number"
            min="1"
            max="20"
            value={slideCount}
            onChange={(e) => setSlideCount(Math.min(Math.max(Number.parseInt(e.target.value) || 1, 1), 20))}
            disabled={isLoading}
            className="w-16 bg-card border-border text-foreground"
          />
          <span className="text-xs text-muted-foreground">(1-20)</span>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your presentation..."
            disabled={isLoading}
            className="flex-1 bg-card border-border text-foreground placeholder:text-muted-foreground"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
