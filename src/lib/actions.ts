import type {ObjectSchema} from 'joi'
import { createRoomSchema, joinRoomSchema } from './validation'
import { v4 as uuidv4 } from 'uuid'

export const handleCreateRoomAction = async ({
    createRoomSchema,
    playerDisplayName,
    RoomName,
}: {
    createRoomSchema: ObjectSchema,
    playerDisplayName: string,
    RoomName: string,
}) => {
    try {
        await createRoomSchema.validate({
            playerDisplayName,
            RoomName,
        })

       // const playerId = uuidv4()

        // Return the validated data for socket emission
        return {
            success: true,
            data: {
                playerName: playerDisplayName,
                roomName: RoomName,
            }
        }
    } catch (error) {
        return {
            error,
            type: "CREATE"
        }
    }
}

export const handleJoinRoomAction = async ({
    joinRoomSchema,
    playerDisplayName,
    RoomId,
}: {
    joinRoomSchema: ObjectSchema,
    playerDisplayName: string,
    RoomId: string,
}) => {
    try {
        await joinRoomSchema.validate({
            playerDisplayName,
            RoomId,
        })

     // const playerId = uuidv4()

        // Return the validated data for socket emission
        return {
            success: true,
            data: {
                playerName: playerDisplayName,
                roomName: RoomId,
            }
        }
    } catch (error) {
        return {
            error,
            type: "JOIN"
        }
    }
}