import crypto from "node:crypto";
import fs from "node:fs/promises";
import util from "node:util";

export const generateRoomId = (length = 10) => {
    const alphabetString = `QWERTYUPASDFGHJKLZXCVBNM23456789abcdefghijklmnopqrsuvwxyz`;
    const size = alphabetString.length ; 
    const randomBytes = crypto.randomBytes(length);
    
    let room_id = "";
    for(let i = 0 ; i < length ; i ++){
        room_id += alphabetString[randomBytes[i]%size];

    }
    return room_id;
    
}



export const dumpToDebugFile = async(payload) => {

    const prettyPayload =  util.inspect(payload, {depth : 2, compact : false});
    const filename = "data.json";

    await fs.writeFile(filename,prettyPayload);

}