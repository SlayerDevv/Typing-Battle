import clientPromise from './mongodb'

// Helper function to get database instance
export async function getDb() {
  const client = await clientPromise
  return client.db(process.env.MONGODB_DB)
}

// Helper function to get a specific collection
export async function getCollection(collectionName) {
  const db = await getDb()
  return db.collection(collectionName)
}

// Specific function for typing stats
export async function saveTypingStats(playerId, stats) {
  const collection = await getCollection('typing-stats')
  
  // Check if player exists and has a lower score
  const existingStats = await collection.findOne({ playerId })
  
  if (!existingStats) {
    // First time player
    return await collection.insertOne({
      playerId,
      wpm: stats.wpm,
      errors: stats.errors,
      accuracy: stats.accuracy,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }
  
  // Only update if new WPM is higher
  if (stats.wpm > existingStats.wpm) {
    return await collection.updateOne(
      { playerId },
      {
        $set: {
          wpm: stats.wpm,
          errors: stats.errors,
          accuracy: stats.accuracy,
          updatedAt: new Date()
        }
      }
    )
  }
  
  return null // No update needed
}