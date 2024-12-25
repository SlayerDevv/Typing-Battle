const db = require("mongoose")

async function Connect(URL){
    try {
        await db.connect(URL)
        console.log(" [ + ] Database connected");
    }catch (e){
        console.log(" [ - ] Database connection failed");
        console.log(e);
    }
}

module.exports = {Connect}