export class Room{
    RoomStatus = Object.freeze({
        WAITING: "WAITING",
        ACTIVE: "ACTIVE",
        FINISHED: "FINISHED",
        ONE_PERSON_JOINED: "ONE_PERSON_JOINED",
        BOTH_PERSONS_JOINED: "BOTH_PERSONS_JOINED"
    });
    constructor(room_id,playersArray){
        this.players = playersArray
        this.room_id = room_id;
        this.status = this.RoomStatus.WAITING;
    }

}