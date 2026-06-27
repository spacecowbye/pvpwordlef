# Current stuff (Happy path)
1. Implement duel events
- socket.emit(`duel:joinRoom`) when user navigates to `/duel/room_id` 
- after the 2nd duel join room event, the server emits event `duel:roomReady` event which starts the wordle game.




# Later Stuff ( Bad Actors / Bad path )
1. Handle socket disconnect gracefully on matchmaking, remove socket and user from mathcmaking queue
2. 
