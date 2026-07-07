const chunks = window.location.href.split('/');
const lastIndex = chunks.length - 1;
const room_id = chunks[lastIndex];

const socket = io();

socket.on("connect",() => {
    console.log(`Connected to server on /duel page`);
    const user_id = localStorage.getItem("user_id");
    payload = {
        room_id,
        user_id
    }
    console.log(payload);
    socket.emit("duel:anon:joinRoom",payload)
})
