import { NextResponse } from 'next/server'
import bwipjs from 'bwip-js'
import fs from 'fs'
import path from 'path'

export async function POST(request: Request) {
  try {
    const { items, type } = await request.json()
    // type is 'books' or 'members'
    // items is an array of objects { id: string, text: string }

    if (!items || !type) {
      return NextResponse.json({ error: 'Missing items or type' }, { status: 400 })
    }

    const baseDir = path.join(process.cwd(), 'public', 'barcodes', type)
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true })
    }

    const generated = []
    
    for (const item of items) {
      if (!item.text) continue
      
      const fileName = `${item.id.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`
      const filePath = path.join(baseDir, fileName)
      
      try {
        const pngBuffer = await bwipjs.toBuffer({
          bcid: 'code128',
          text: item.text,
          scale: 3,
          height: 10,
          includetext: true,
          textxalign: 'center',
        })
        
        fs.writeFileSync(filePath, pngBuffer)
        generated.push(item.id)
      } catch (err) {
        console.error(`Failed to generate barcode for ${item.text}:`, err)
      }
    }

    return NextResponse.json({ success: true, count: generated.length, generated })
  } catch (error) {
    console.error('Error generating barcodes:', error)
    return NextResponse.json({ error: 'Failed to generate barcodes' }, { status: 500 })
  }
}
