import { type NextRequest, NextResponse } from "next/server"
import PptxGenJS from "pptxgenjs"

interface Slide {
  title: string
  content: string
  layout: string
}

export async function POST(request: NextRequest) {
  try {
    const { slides } = await request.json()

    const prs = new PptxGenJS()

    // Set presentation properties
    prs.defineLayout({ name: "LAYOUT1", width: 10, height: 7.5 })

    // Add slides
    slides.forEach((slide: Slide) => {
      const slideObj = prs.addSlide()

      // Add background
      slideObj.background = { color: "1a1a2e" }

      // Add title
      slideObj.addText(slide.title, {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 1,
        fontSize: 44,
        bold: true,
        color: "ffffff",
        fontFace: "Arial",
      })

      // Add content
      slideObj.addText(slide.content, {
        x: 0.5,
        y: 1.8,
        w: 9,
        h: 5,
        fontSize: 18,
        color: "e0e0e0",
        fontFace: "Arial",
      })

      // Add footer
      slideObj.addText("AI Generated Presentation", {
        x: 0.5,
        y: 7,
        w: 9,
        h: 0.4,
        fontSize: 10,
        color: "888888",
        align: "right",
      })
    })

    // Generate buffer
    const buffer = await prs.write({ outputType: "arraybuffer" })

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": 'attachment; filename="presentation.pptx"',
      },
    })
  } catch (error) {
    console.error("Error generating PPT:", error)
    return NextResponse.json(
      { error: "Failed to generate PPT", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
