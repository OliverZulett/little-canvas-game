var canvas = document.getElementById("canvas");
// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;

var ctx = canvas.getContext("2d");

var W = canvas.width;
var H = canvas.height;

//variables para dibujar el rectángulo
let xi = 0;
let yi = 0;
let lado = 50;
let dir = 4;
let speed = 5;
let boxColor = "black";

const directions = new Map();
// const foods = new Map();
let foods = [];
let eating = false;
let points = 0;

directions.set("ArrowUp", 1);
directions.set("ArrowDown", 2);
directions.set("ArrowLeft", 3);
directions.set("ArrowRight", 4);

run();

function run() {
  // console.log(xi);
  mover();
  dibujar();
  eatFood({ x: xi + lado / 2, y: yi + lado / 2 });
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
  rectangulo(xi, yi, lado, lado, boxColor);
  if (xi === W + lado) {
    console.log("this is the end");
    // dir = 2
    xi = 0;
  } else if (xi === 0 - lado) {
    console.log("this is the begging");
    xi = W;
    // dir = 1
  } else if (yi === H + lado) {
    console.log("this is the end");
    // dir = 2
    yi = 0;
  } else if (yi === 0 - lado) {
    console.log("this is the begging");
    yi = H;
    // dir = 1
  }
}

function rectangulo(xi, yi, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(xi, yi, w, h);
}

function limpiar() {
  rectangulo(0, 0, W, H, "white");
  drawFoods();
}

document.addEventListener("keyup", (keyHandler) => {
  const { key } = keyHandler;
  dir = directions.has(key) ? directions.get(key) : dir;
  // mover();
});

// generate circles

generateFood();
drawFoods();

function drawFoods() {
  foods.forEach((food) => {
    drawFood({ ...food, radius: lado / 2 });
  });
}

function generateFood() {
  for (let index = 0; index < 10; index++) {
    foods.push({
      x: Math.floor(Math.random() * (W - lado / 2 - lado / 2 + 1) + lado / 2),
      y: Math.floor(Math.random() * (H - lado / 2 - lado / 2 + 1) + lado / 2),
      color: "#" + Math.floor(Math.random() * 16777215).toString(16),
      check: false,
    });
  }
  console.log(foods);
}

function drawFood(foodProps) {
  // console.log("props ==> ", foodProps);
  const { x, y, radius, color, check } = foodProps;
  if (!check) {
    ctx.beginPath();
    // ctx.arc(lado / 2, lado / 2, lado / 2, 0, 2 * Math.PI);
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    // ctx.fillStyle = "#" + Math.floor(Math.random() * 16777215).toString(16);
    ctx.fillStyle = color;
    ctx.fill();
  }
}

async function eatFoodPromise() {}

function eatFood(position) {
  foods = foods.filter((food) => {
    if (position.x >= food.x - lado / 2 && position.x <= food.x + lado / 2) {
      if (position.y >= food.y - lado / 2 && position.y <= food.y + lado / 2) {
        console.log("eat");
        points += 1;
        boxColor = food.color;
        return false;
      }
    }
    return true;
  });

  if (points === 10) {
    lado = lado - lado * 0.25;
    spedd = speed - speed * 0.25;
    generateFood();
    points = 0;
    // drawFoods();
  }
}
