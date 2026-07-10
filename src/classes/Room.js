export class Room{
    RoomStatus = Object.freeze({
        WAITING: "WAITING",
        ACTIVE: "ACTIVE",
        FINISHED: "FINISHED",
        ONE_PERSON_JOINED: "ONE_PERSON_JOINED",
        BOTH_PERSONS_JOINED: "BOTH_PERSONS_JOINED"
    });
    constructor(room_id,playersArray){


        const player1 =  playersArray[0];
        const player2 = playersArray[1];
        
        this.players = [player1, player2];
        console.log(this.players);
        this.room_id = room_id;
        this.status = this.RoomStatus.WAITING;
    }
    hasPlayer(player_id){
        if(this.players[0] == player_id || this.players[1] == player_id){
            return true;
        }
        else{
            return false;
        }
    }

}