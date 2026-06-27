/**
 * Represents an anonymous Player who hasn't found a match.
 */
export class AnonymousPlayer {
    
    /**
     * Creates an instance of AnonymousUser.
     * @constructor
     * @param {string} user_id 
     */

    constructor(user_id) {
        this.socket = null ; // to be populated post matchmaking, otherwise this whole thing will be stringifed when we put into redis.
        this.connected = true;
        this.user_id = user_id // generate via crypto random uuid
    }
    destroy(){
    
    }
}

