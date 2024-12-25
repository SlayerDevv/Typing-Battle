import joi from 'joi';

export const createRoomSchema = joi.object({
    playerDisplayName: joi.string().required().messages({
        "string.empty": "Player displayName cannot be empty",
        "any.required": "Player displayName is required"
    }),
    RoomName: joi.string().required().messages({
        "string.empty": "Room name cannot be empty",
        "any.required": "Room name is required"
    }),
});

export const joinRoomSchema = joi.object({
    playerDisplayName: joi.string().required().messages({
        "string.empty": "Player displayName cannot be empty",
        "any.required": "Player displayName is required"
    }),
    RoomId: joi.string().required().messages({
        "string.empty": "Room ID cannot be empty",
        "any.required": "Room ID is required"
    }),
});
