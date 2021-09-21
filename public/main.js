'use strict';

let hostname = "192.168.0.177:3434"

let socket;


function debug(stuff)
{
  socket.emit("debug", stuff);
}

let NUMLAYER = 1

let canvases = document.getElementById("canvases");
let ctx = [];

for (let i = 0; i < NUMLAYER; i++)
{
  let can = canvases.appendChild(document.createElement("canvas"));
  can.id = "canvas-" + i.toString();
  can.width = window.innerWidth*0.9;
  can.height = window.innerHeight*0.9;
  can.style.position = "absolute";
  can.style.background = "transparent";
  can.style.left = 0;
  can.style.top  = 0;

  ctx.push(can.getContext('2d'));
  ctx[i].fillStyle = "blue";
  ctx[i].textBaseline = "top";
  ctx[i].textAlign = "center";
  ctx[i].font = "20px Courier New, monospace";
  ctx[i].textBaseline = "middle"
  //ctx[i].textAlign = "center"
}

function loadImg(fname)
{
  return new Promise((resolve) =>
    {
      let img = new Image();
      img.onload = () => {resolve(img);};
      img.src = fname;
    })
}

// text with wrapping
function drawText(l, text, x, y, maxWidth = undefined)
{
  if (typeof text == "string")
  {
    let height = ctx[l].font.substring(0,2)*1.5;
    let lines = text.split('\n');
    for (let i = 0; i<lines.length; ++i)
      ctx[l].fillText(lines[i], x, y + i*height, maxWidth);
  }
  else
  {
    ctx[l].fillText(text, x, y, maxWidth);
  }

}
// https://stackoverflow.com/questions/25095548/how-to-draw-a-circle-in-html5-canvas-using-javascript
function drawCircle(l, x, y, radius, fill = false, stroke=true, strokeWidth=4)
{
  ctx[l].beginPath()
  ctx[l].arc(x + 32, y + 32, radius, 0, 2 * Math.PI, false)
  if (fill)
  {
    ctx[l].fillStyle = fill
    ctx[l].fill()
  }
  if (stroke)
  {
    ctx[l].lineWidth = strokeWidth
    ctx[l].strokeStyle = stroke
    ctx[l].stroke()
  }
}

function clearCanvas()
{
  for (let i = 0; i < NUMLAYER; i++)
    ctx[i].clearRect(0,0,760, 640)
}

function coordInSet(s, i, j)
{
  return s.has(JSON.stringify([i,j]));
}

let users = []



let can = document.getElementById("canvas");
let ongoingTouches = [];

function handleStart(evt) {
  evt.preventDefault();
  //var ctx = el.getContext("2d");
  var touches = evt.changedTouches;

  for (var i = 0; i < touches.length; i++) {
    ongoingTouches.push(copyTouch(touches[i]));
  }
  return false;
}

function handleEnd(evt) {
  evt.preventDefault();
  var touches = evt.changedTouches;

  for (var i = 0; i < touches.length; i++) {
    var idx = ongoingTouchIndexById(touches[i].identifier);

    if (idx >= 0) {
      ongoingTouches.splice(idx, 1);  // remove it; we're done
    } else {
    }
  }
  return false;
}

function handleMove(evt) {
  evt.preventDefault();
  var touches = evt.changedTouches;

  for (var i = 0; i < touches.length; i++) {
    var idx = ongoingTouchIndexById(touches[i].identifier);

    if (idx >= 0) {
      ongoingTouches.splice(idx, 1, copyTouch(touches[i]));  // swap in the new touch record
    } else {
    }
  }
  return false;
}

function copyTouch({ identifier, clientX, clientY }) {
  return { identifier, clientX, clientY };
}
function ongoingTouchIndexById(idToFind) {
  for (var i = 0; i < ongoingTouches.length; i++) {
    var id = ongoingTouches[i].identifier;

    if (id == idToFind) {
      return i;
    }
  }
  return -1;    // not found
}

function Rect (x, y, w, h) {

    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.contains = function (x, y) {
        return this.x <= x && x <= this.x + this.w &&
               this.y <= y && y <= this.y + this.h;
    }

    this.draw = function (ctx) {
        ctx.rect(this.x, this.y, this.w, this.h)
    }
}


let buttons = [ "a","b","x","y","du","dr","dd","dl","rl","ru","rd","rr","lu","lr","ld","ll","-","+","zr","r","zl","l"];
let buttonboxes = {}
let pressed = {}
for (let name of buttons)
{
  let el = document.getElementById(name)
  let h = el.offsetHeight;
  let w = el.offsetWidth;
  let x = el.offsetLeft;
  let y = el.offsetTop;

  buttonboxes[name] = new Rect(x, y, w, h);
  pressed[name] = false;
}



window.onload = async () => {

  console.log("kek");
  socket = io.connect(hostname);
  
  socket.emit("pair", {});

  document.addEventListener("touchstart", handleStart, {passive:false});
  document.addEventListener("touchend", handleEnd, {passive:false});
  document.addEventListener("touchcancel", handleEnd, {passive:false});
  document.addEventListener("touchmove", handleMove, {passive:false});

  function getPressed()
  {
    let keyspressed = new Set();
    for (let touch of ongoingTouches)
    {
      let x = touch.clientX;
      let y = touch.clientY;
      for (let [n, r] of Object.entries(buttonboxes))
      {
	if (r.contains(x, y))
	{
	  keyspressed.add(n)
	}
      }
    }

    let send={};
    for (let key of Object.keys(pressed))
    {
      let currentState = (keyspressed.has(key) );
      if (pressed[key] != currentState )
      {
	pressed[key] = currentState;
	send[key] = currentState;
      }
    }
    socket.emit("keychange",  send);
  }
  setInterval(getPressed, 3)





}
