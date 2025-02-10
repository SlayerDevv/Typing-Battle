import {NextRequest, NextResponse} from "next/server"
import {clerkClient} from "@clerk/nextjs/server"
import {updatePlayerId, addUserId, collection} from "@/lib/db" 
type Data = {
    username?: string;
    firstName?: string;
    lastName?: string;
}
export async function POST(req: NextRequest,res: NextResponse){
    const {userId, username,firstName, lastName} = await req.json();
    const client = await clerkClient();
    const data: Data = {};
    if (username !== undefined) data.username = username;
    if (firstName !== undefined) data.firstName = firstName;
    if (lastName !== undefined) data.lastName = lastName;
    try {
        if (Object.keys(data).length > 0){
          const user = await client.users.updateUser(userId, data);
          await updatePlayerId(userId, user.fullName);
          return NextResponse.json({message: 'User updated successfully', user: user}, {status: 200})
        }
        
    }catch (err){
        return NextResponse.json({error: 'Failed to update user'}, {status: 500})
    }

}