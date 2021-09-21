const express = require("express");
var crypto = require('crypto');

const app = express();
let port = 3434

app.use(express.static(__dirname + "/public"));

const an_re = "[A-Za-z0-9]"


const { exec } = require('child_process');



app.get("/",  (req, res) => {
	res.sendFile( __dirname + "/views/index.html");
});


var http = require('http');

const server = http.createServer(app)
server.listen(port, () => {});

let xdowindow = null;
exec("xdotool search --onlyvisible --class yuzu | head -n 1", (err, stdout, stderr) => {
  if (err) {
    return;
  }

  // the *entire* stdout and stderr (buffered)
  xdowindow = stdout.trim();
});


const { Server } = require("socket.io");
const io = new Server(server);


let users = [];


function addSocket(name, socket)
{
  users.push({name:name,socket:socket})
  socket.playerID = users.length;
}

function removeSocket(socket)
{
  for (let i = 0; i < users.length; ++i)
  {
    if (users[i].socket == socket)
    {
      users.splice(i, 1);
      break
    }
  }
}

const getmap = {
  1:
  { a:"S",
    b:"A",
    x:"Q",
    y:"X",
    du:"T",
    dr:"H",
    dl:"F",
    dd:"G",
    ru:"I",
    rr:"L",
    rl:"J",
    rd:"K",
    lu:"Up",
    lr:"Right",
    ll:"Left",
    ld:"Down",
    r:"2",
    zr:"W",
    l:"1",
    zl:"X",
    "-":"M",
    "+":"N",
  },
  2:
  { a:"3",
    b:"4",
    x:"5",
    y:"6",
    du:"7",
    dr:"8",
    dl:"9",
    dd:"0",
    ru:"R",
    rr:"E",
    rl:"Z",
    rd:"B",
    lu:"V",
    lr:"C",
    ll:"minus",
    ld:"plus",
    r:"comma",
    zr:"period",
    l:"slash",
    zl:"F1",
    "-":"F2",
    "+":"F3",
  }
}
      



io.on("connection", (socket)=>
{

  socket.on('test',(data)=> {
  });

  socket.on('pair',(id_name)=> {
    removeSocket(socket);

    addSocket("KEKW", socket);

  });

  socket.on('keychange',(k)=> {
    let buttonmap = getmap[socket.playerID]
    if (buttonmap === undefined)
      return
    for (let [key, pressed] of Object.entries(k))
    {
      let button = buttonmap[key]; 
      let xdocmd = (pressed) ? "keydown" : "keyup";
      let cmd = "xdotool " + xdocmd + " --delay 0 --window " + xdowindow + " " + button ;
      //let cmd = "xdotool " + xdocmd + " --delay 0 " + button;
  //      exec(cmd);
      console.log(cmd)
    }

  });

  socket.on('disconnect',()=> {
    removeSocket(socket);
  });
  socket.on('debug',(stuff)=> {
  });

    
});

