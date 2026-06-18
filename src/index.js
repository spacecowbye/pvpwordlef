import express from "express"


const app = express();
const PORT = 8080;

app.use(express.json());


app.listen(PORT,()=>{
  console.log("Server started on PORT", PORT);
})