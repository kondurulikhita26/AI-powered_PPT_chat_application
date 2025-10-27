import { GoogleGenerativeAI } from "@google/generative-ai"
import { type NextRequest, NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "")

interface Slide {
  title: string
  content: string
  layout: string
  imageUrl?: string
  imagePrompt?: string
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, previousSlides, slideCount = 5 } = await request.json()

    const validSlideCount = Math.min(Math.max(Number.parseInt(slideCount) || 5, 1), 20)

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    const systemPrompt = `You are an expert presentation designer. Generate PowerPoint slide content based on user requests.
    
Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks, just pure JSON):
{
  "slides": [
    {
      "title": "Slide Title",
      "content": "Slide content/bullet points",
      "layout": "title-content",
      "imagePrompt": "A detailed description for an AI-generated image (optional)"
    }
  ],
  "message": "Brief confirmation message"
}

Create exactly ${validSlideCount} slides that are professional, well-structured, and visually appealing.
For each slide, include an imagePrompt if a visual would enhance the content.
${previousSlides && previousSlides.length > 0 ? `Previous slides exist. Consider the context and update/expand appropriately.` : ""}`

    const result = await model.generateContent([
      {
        text: systemPrompt + "\n\nUser request: " + prompt,
      },
    ])

    const responseText = result.response.text()
    console.log("[v0] Raw response:", responseText.substring(0, 200))

    let jsonString = responseText

    // Remove markdown code blocks if present
    jsonString = jsonString.replace(/```json\n?/g, "").replace(/```\n?/g, "")

    // Extract JSON object - find the first { and last }
    const firstBrace = jsonString.indexOf("{")
    const lastBrace = jsonString.lastIndexOf("}")

    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("No JSON object found in response")
    }

    jsonString = jsonString.substring(firstBrace, lastBrace + 1)

    let parsedResponse
    try {
      parsedResponse = JSON.parse(jsonString)
    } catch (parseError) {
      console.error("[v0] JSON parse error:", parseError)
      console.error("[v0] Attempted to parse:", jsonString.substring(0, 500))
      throw new Error(
        `Invalid JSON response from AI: ${parseError instanceof Error ? parseError.message : "Unknown error"}`,
      )
    }

    if (!parsedResponse.slides || !Array.isArray(parsedResponse.slides)) {
      throw new Error("Response missing 'slides' array")
    }

    const slidesWithImages = await Promise.all(
      parsedResponse.slides.map(async (slide: Slide) => {
        if (slide.imagePrompt) {
          try {
            const imageModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
            const imageResult = await imageModel.generateContent({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `Generate an image for this slide: ${slide.imagePrompt}`,
                    },
                  ],
                },
              ],
            })

            const imagePart = imageResult.response.candidates?.[0]?.content?.parts?.find((part: any) =>
              part.inlineData?.mimeType?.startsWith("image/"),
            )

            if (imagePart?.inlineData) {
              const base64Image = imagePart.inlineData.data
              const mimeType = imagePart.inlineData.mimeType
              slide.imageUrl = `data:${mimeType};base64,${base64Image}`
            }
          } catch (imageError) {
            console.error("Error generating image:", imageError)
            // Continue without image if generation fails
          }
        }
        return slide
      }),
    )

    return NextResponse.json({
      ...parsedResponse,
      slides: slidesWithImages,
    })
  } catch (error) {
    console.error("Error generating slides:", error)
    return NextResponse.json(
      { error: "Failed to generate slides", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
