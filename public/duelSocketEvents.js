// linked to duel.html
// if url is not equal to room_id in payload then raise error?

const url = window.location.href;
const chunks = url.split('/');
const room_id = chunks.at(-1);


const user_id = localStorage.getItem("user_id");

const socket = io({
  auth : {
    "user_id" : user_id
  }
})

socket.on("connect", () => {
  console.log(`Connected to server on /duel page`);
  const payload = {
    room_id,
    user_id,
  };
  console.log(payload); 
  socket.emit("duel:anon:joinRoom", payload);
  
});

// 2. Handle missing room error
socket.on("duel:anon:NO_SUCH_ROOM", () => {
  showError("Room not found or has expired.");
});

// 3. Handle Player 1 waiting state
socket.on("duel:anon:READY_PLAYER_ONE", () => {
  showToast("Waiting for an opponent to join...", 2000);
  // Optional: Update local state / render "Waiting" spinner in your game UI
});

// 4. Handle Player 2 join / Game Start state
socket.on("duel:anon:ROOM_READY", () => {
  showToast("Opponent connected! Game starting...", 2500);
  // Trigger game initialization or transition to match board
  onStartGame();
});

// 5. Handle unexpected user payload
socket.on("duel:anon:USER_NOT_EXPECTED", () => {
  showError("User session validation failed. Please try reconnecting.");
});

// 6. Handle room overflow
socket.on("duel:anon:IMPROPER_CONDUCT_LAD", () => {
  showError("This duel room is already full.");
});

function onStartGame(){
    console.log(`Starting the game baby`);
}
socket.on("duel:anon:BEGIN_GAME",() => {
  console.log(`Part of the room now baby`);
})