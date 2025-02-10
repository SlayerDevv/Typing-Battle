import { NextResponse } from 'next/server'
import { saveTypingStats } from '@/lib/db'
import { getCollection } from '@/lib/db'
export async function POST(request) {
  try {
    const { playerId, userId,stats } = await request.json()
    const result = await saveTypingStats(playerId, userId,stats)
    
    if (result === null) {
      return NextResponse.json({ message: 'No update needed' }, { status: 200 })
    }
    
    return NextResponse.json({ message: 'Stats updated' }, { status: 200 })
  } catch (error) {
    console.error('Error saving stats:', error)
    return NextResponse.json({ error: 'Failed to save stats' }, { status: 500 })
  }
}

export async function GET() {
    try {
      const collection = await getCollection('typing-stats')
      const stats = await collection.find({}).toArray()
      return NextResponse.json(stats)
    } catch (error) {
      console.error('Error fetching stats:', error)
      return NextResponse.json(
        { error: 'Failed to fetch stats' },
        { status: 500 }
      )
    }
  }