import type {ObjectSchema} from 'joi'

export const handleCreateRoomAction = async({createRoomSchema,playerDisplayName,RoomName }: {createRoomSchema: ObjectSchema, playerDisplayName: string, RoomName: string}) => {
    const {error} = await createRoomSchema.validate({playerDisplayName, RoomName});
    return {type: "CREATE", error: error}
}

export const handleJoinRoomAction = async({joinRoomSchema,playerDisplayName,RoomId }: {joinRoomSchema: ObjectSchema, playerDisplayName: string, RoomId: string}) => {
    const {error} = await joinRoomSchema.validate({playerDisplayName, RoomId})
    return {type: "JOIN", error: error}
}