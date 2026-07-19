/**
 * Represents an anonymous Player who hasn't found a match.
 */
export class AnonymousPlayer {
    
    /**
     * Creates an instance of AnonymousUser.
     * @constructor
     * @param {string} user_id 
     */

    // we don't need a socket object here, if we have a mapping of user_id to socket_object done in user service
    constructor(user_id) {
        this.connected = true;  
        this.user_id = user_id // generate via crypto random uuid
    }
    destroy(){
    
    }
}

export class AnonymousPlayerState{
    
    constructor(anonymousPlayer){
        this.user_id = anonymousPlayer.user_id; 
        // Game specific data
        this.guesses = [];
    }
}

