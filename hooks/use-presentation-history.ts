"use client"

import { useState, useEffect } from "react"

export interface Presentation {
  id: string
  name: string
  messages: Array<{
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
  }>
  slides: Array<{
    title: string
    content: string
    layout: string
  }>
  createdAt: Date
  updatedAt: Date
}

const STORAGE_KEY = "presentation_history"

export function usePresentationHistory() {
  const [presentations, setPresentations] = useState<Presentation[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load presentations from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Convert date strings back to Date objects
        const presentations = parsed.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
          messages: p.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })),
        }))
        setPresentations(presentations)
      } catch (error) {
        console.error("Failed to load presentation history:", error)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save presentations to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presentations))
    }
  }, [presentations, isLoaded])

  const savePresentation = (name: string, messages: Presentation["messages"], slides: Presentation["slides"]) => {
    const newPresentation: Presentation = {
      id: Date.now().toString(),
      name,
      messages,
      slides,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setPresentations((prev) => [newPresentation, ...prev])
    return newPresentation.id
  }

  const updatePresentation = (id: string, updates: Partial<Omit<Presentation, "id" | "createdAt">>) => {
    setPresentations((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              ...updates,
              updatedAt: new Date(),
            }
          : p,
      ),
    )
  }

  const deletePresentation = (id: string) => {
    setPresentations((prev) => prev.filter((p) => p.id !== id))
  }

  const getPresentation = (id: string) => {
    return presentations.find((p) => p.id === id)
  }

  return {
    presentations,
    isLoaded,
    savePresentation,
    updatePresentation,
    deletePresentation,
    getPresentation,
  }
}
