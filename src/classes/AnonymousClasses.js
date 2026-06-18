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
        this.connected = true;
        this.user_id = user_id // persistent, stored on the client as a secret, then sent to us.
    
    }
}

