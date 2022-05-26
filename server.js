const express = require("express");
const app = express();
const cors = require("cors");
const { v4 } = require("uuid");

app.use(cors({

  origin: '*',
  
  }))

let broadcaster;
const port = 4000;

const http = require("http");
const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.static(__dirname + "/public"));

app.set('view engine', 'ejs');

app.get('/', (req, res, next) => {
    const roomId = v4();
    return res.redirect(`/${roomId}`)
});



io.sockets.on("error", e => console.log(e));
io.sockets.on("connection", socket => {
  socket.on("broadcaster", () => {
    broadcaster = socket.id;
    socket.broadcast.emit("broadcaster");
  });
  socket.on("watcher", () => {
    socket.to(broadcaster).emit("watcher", socket.id);
  });
  socket.on("offer", (id, message) => {
    socket.to(id).emit("offer", socket.id, message);
  });
  socket.on("answer", (id, message) => {
    socket.to(id).emit("answer", socket.id, message);
  });
  socket.on("candidate", (id, message) => {
    socket.to(id).emit("candidate", socket.id, message);
  });
  socket.on("disconnect", () => {
    socket.to(broadcaster).emit("disconnectPeer", socket.id);
  });
});
server.listen(port, () => console.log(`Server is running on port ${port}`));
