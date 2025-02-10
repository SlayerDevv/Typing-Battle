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
const calculateOverallScore = (stats) => {
  // Base score starts with WPM
  let baseScore = stats.wpm;
  
  // Multiply by accuracy percentage (0-1) to heavily penalize low accuracy
  baseScore *= (stats.accuracy / 100);
  
  // Apply error penalty - each error reduces score by 5%
  const errorPenalty = Math.max(0, 1 - (stats.errors * 0.05));
  baseScore *= errorPenalty;
  
  // Severe penalty for low accuracy or high errors
  if (stats.accuracy < 50 || stats.errors > 20) {
    baseScore *= 0.1;
  }
  
  // Round to 1 decimal place
  return Math.round(baseScore * 10) / 10;
};

export const collection = await getCollection('typing-stats')

export async function saveTypingStats(playerId, userId, stats) {
  
  // Calculate overall score for new stats
  const newOverallScore = calculateOverallScore(stats)
  
  // Check if player exists
  const existingStats = await collection.findOne({ userId })
  
  if (!existingStats) {
    // First time player - save stats with overall score
    return await collection.insertOne({
      playerId,
      userId,
      wpm: stats.wpm,
      errors: stats.errors,
      accuracy: stats.accuracy,
      overallScore: newOverallScore,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }
  
  // Calculate overall score for existing stats
  const existingOverallScore = calculateOverallScore(existingStats)
  
  // Only update if new overall score is higher
  if (newOverallScore > existingOverallScore) {
    return await collection.updateOne(
      { userId },
      {
        $set: {
          playerId,
          wpm: stats.wpm,
          errors: stats.errors,
          accuracy: stats.accuracy,
          overallScore: newOverallScore,
          updatedAt: new Date()
        }
      }
    )
  }

  
  
  return null // No update needed
}

export async function updatePlayerId(userId, playerId){
  await collection.updateOne({userId}, { $set: {
    playerId
  }})
}

export async function addUserId(playerId, userId){
  await collection.updateOne({playerId}, { $set: {userId: userId}});
}