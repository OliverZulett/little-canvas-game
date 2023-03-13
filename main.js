var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var W = canvas.width;
var H = canvas.height;

//variables para dibujar el rectángulo
let xi = 0;
let yi = 0;
let lado = 20;
let dir = 1;
let speed = 5;

const directions = new Map();
const foods = new Map();

directions.set("ArrowUp", 1);
directions.set("ArrowDown", 2);
directions.set("ArrowLeft", 3);
directions.set("ArrowRight", 4);

run();

function run() {
  // console.log(xi);
  mover();
  dibujar();
  setTimeout(run, speed);
}

function mover() {
  switch (dir) {
    case 1:
      yi--;
      break;
    case 2:
      yi++;
      break;
    case 3:
      xi--;
      break;
    case 4:
      xi++;
      break;
  }
}

//función que detecta si el cuadrado ya llegó al límite del Canva, W. Y si llegó, cambia el valor de la vvariable DIR por 2
function dibujar() {
  limpiar();
  rectangulo(xi, yi, lado, lado, "black");
  // if (xi === (W - lado)) {
  //   console.log('this is the end');
  //   dir = 2
  // } else if (xi === 0) {
  //   console.log('this is the begging');
  //   dir = 1
  // }
}

function rectangulo(xi, yi, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(xi, yi, w, h);
}

function limpiar() {
  rectangulo(0, 0, W, H, "white");
}

document.addEventListener("keyup", (keyHandler) => {
  const { key } = keyHandler;
  dir = directions.has(key) ? directions.get(key) : dir;
  // mover();
});

// generate circles

function generateFood() {
  for (let index = 0; index < 10; index++) {
    foods.set(
      {
        x: Math.floor(Math.random() * (W - lado / 2 - lado / 2 + 1) + lado / 2),
        y: Math.floor(Math.random() * (H - lado / 2 - lado / 2 + 1) + lado / 2),
      },
      "#" + Math.floor(Math.random() * 16777215).toString(16)
    );
  }
  console.log(foods);
}

generateFood();

function drawFood(foodProps) {
  const {x, y, radius} = foodProps;
  ctx.beginPath();
  ctx.arc(lado / 2, lado / 2, lado / 2, 0, 2 * Math.PI);
  ctx.fillStyle = "#" + Math.floor(Math.random() * 16777215).toString(16);
  ctx.fill();
}
