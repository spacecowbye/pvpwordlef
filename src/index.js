import express from "express"
import { Logger } from "./utils/logger.js";
import { config } from "./config/config.js";
import { createServer } from "node:http"
import { Server } from "socket.io";
import { registerSocketHandlers } from "./sockets/socketConnections.js";
import gameRouter from "./routes/duel.routes.js";



const filename = import.meta.url
const logger = new Logger(filename);

const app = express();
const server = createServer(app);
const io = new Server(server);

const PORT = config.PORT;



app.get("/duel/:room_id",(req,res) => {
  res.status(200).json({
    data : "ok"
  })
})


app.use(express.static("public"));
app.use(express.json());



//socket stuff here
registerSocketHandlers(io);


server.listen(PORT,()=>{
  logger.info(`Server started on Port ${PORT}`);
})