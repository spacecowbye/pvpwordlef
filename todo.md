# Current stuff (Happy path)

1. Implement duel events
    - [x] socket.emit(`duel:joinRoom`) when user navigates to `/duel/:room_id` 
    - [x] after the 2nd duel join room event, the server emits event `duel:roomReady` event which starts the wordle game.

2. Implement `/duel` page 
    - [ ] Port full wordle logic here 
    - [ ] Client side validation of the word 
    - [ ] Implement `duel:wordle:guess` event client side 
    - [ ] Implement handling of that on server side

3. Implement the mammoth gameManager 😢
    - [ ] a lot of stuff, i will update this latter

# Later Stuff ( Bad Actors / Bad path / porting ui / logic from vibe coded game )

1. Handle socket disconnect gracefully from matchmaking queue, remove socket and user from matchmaking queue
2. Implement home screen similar to vibe-coded pvp wordle
3. Changing url on client should give no such room instead gives room is full? 