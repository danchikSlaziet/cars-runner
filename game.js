let carWidth = 201 * 0.14;
let carHeight = 512 * 0.14;
let obstacleCount = 3;
let coinGenerationTimeout;
let scoreCount = 0;
let detect = new MobileDetect(window.navigator.userAgent);
const pauseBtn = document.querySelector('.pause');
const pausePage = document.querySelector('.pause-page');
const pausePageContinue = pausePage.querySelector('.pause-page__btn_continue');
const pausePageRestart = pausePage.querySelector('.pause-page__btn_restart');
const arrowLeft = document.querySelector('.arrow-btn_left');
const arrowRight = document.querySelector('.arrow-btn_right');
const score = document.querySelector('.score');
const scorePage = document.querySelector('.score-page');
const scoreButton = scorePage.querySelector('.score-page__btn');
const scorePageText = scorePage.querySelector('.score-page__text');
const restartPage = document.querySelector('.restart-page');
const restartButton = restartPage.querySelector('.restart-page__btn');

class Road {
  constructor(image, y) {
    this.x = 0;
    this.y = y;
    this.loaded = false;

    this.image = new Image();

    var obj = this;

    this.image.addEventListener("load", function () {
      obj.loaded = true;
    });

    this.image.src = image;
  }

  Update(road) {
    this.y += speed; //The image will move down with every frame

    if (this.y > window.innerHeight) {
      this.y = road.y - canvas.height + speed;
    }
  }
}

class Car {
  constructor(image, x, y, isPlayer) {
    this.x = x;
    this.y = y;
    this.loaded = false;
    this.dead = false;
		this.paused = false;
    this.isPlayer = isPlayer;

    this.image = new Image();

    var obj = this;

    this.image.addEventListener("load", function () {
      obj.loaded = true;
    });

    this.image.src = image;
  }

  Update() {
    if (!this.isPlayer) {
      this.y += speed;
    }

    if (this.y > canvas.height + 50) {
      this.dead = true;
    }
  }

  Collide(car) {
    var hit = false;

    if (
      this.y < car.y + car.image.height * scale &&
      this.y + this.image.height * scale > car.y
    ) {
      // If there is collision by y
      if (
        this.x + this.image.width * scale > car.x &&
        this.x < car.x + car.image.width * scale
      ) {
        // If there is collision by x
        hit = true;
      }
    }

    return hit;
  }

  // Move(v, direction) {
  //   if (v == "x") {
  //     const step = canvas.width / 3;
  //     // Moving on x
  //     if (direction == "left") {
  //       if (this.x < 130) {
  //         return;
  //       } else {
  //         this.x -= step;
  //       }
  //     }
  //     if (direction == "right") {
  //       this.x += step;
  //     }

  //     // Rolling back the changes if the car left the screen
  //     if (this.x + this.image.width * scale > canvas.width) {
  //       this.x -= step;
  //     }

  //     if (this.x < 0) {
  //       this.x = 0;
  //     }
  //   }
  // }
	Move(v, direction, speedMultiplier = 6) {
		if (v == "x" && !this.isAnimating) {
			this.isAnimating = true;
	
			const targetX = (direction == "left") ? Math.max(0, this.x - canvas.width / 3) :
																							 Math.min(canvas.width - this.image.width * scale, this.x + canvas.width / 3);
	
			// Check if the car is in the extreme lanes
			if ((this.x <= 130 && direction == "left") || (this.x + this.image.width * scale > canvas.width*0.8 && direction == "right")) {
				this.isAnimating = false;
				return;
			}
	
			const step = (targetX - this.x > 0) ? canvas.width / 200 * speedMultiplier : -canvas.width / 200 * speedMultiplier;
	
			const move = () => {
				if ((direction == "left" && this.x > targetX) || (direction == "right" && this.x < targetX)) {
					this.x += step;
	
					if ((direction == "left" && this.x <= targetX) || (direction == "right" && this.x >= targetX)) {
						this.x = targetX;
						this.isAnimating = false;
					} else {
						requestAnimationFrame(move);
					}
				}
			};
	
			move();
		}
	}
}

class Coin {
  constructor(image, x, y) {
    this.x = x;
    this.y = y;
    this.loaded = false;
    this.dead = false;

    this.image = new Image();

    var obj = this;

    this.image.addEventListener("load", function () {
      obj.loaded = true;
    });

    this.image.src = image;
  }

  Update() {
    this.y += speed;

    if (this.y > canvas.height + 50) {
      this.dead = true;
    }
  }

  Collide(car) {
    var hit = false;

    if (
      this.y < car.y + car.image.height * scale &&
      this.y + this.image.height * scale > car.y
    ) {
      // If there is collision by y
      if (
        this.x + this.image.width * scale > car.x &&
        this.x < car.x + car.image.width * scale
      ) {
        // If there is collision by x
        hit = true;
      }
    }

    return hit;
  }
}

var coins = [];

var canvas = document.getElementById("canvas"); // Getting the canvas from DOM
var ctx = canvas.getContext("2d"); // Getting the context to work with the canvas

var scale = 0.13; // Cars scale

Resize(); // Changing the canvas size on startup

window.addEventListener("resize", Resize); // Change the canvas size with the window size

// Forbidding opening the context menu to make the game play better on mobile devices
canvas.addEventListener("contextmenu", function (e) {
  e.preventDefault();
  return false;
});

window.addEventListener("keydown", function (e) {
  KeyDown(e);
}); // Listening for keyboard events
arrowLeft.addEventListener("touchstart", () => {
  ButtonDown("left");
});
arrowRight.addEventListener("touchstart", () => {
  ButtonDown("right");
});
if (detect.os() == null) {
	arrowLeft.addEventListener("click", () => {
		ButtonDown("left");
	});
	arrowRight.addEventListener("click", () => {
		ButtonDown("right");
	});
}

var objects = []; // Game objects

var roads = [
  new Road("images/road.png", 0),
  new Road("images/road.png", canvas.height),
]; // Backgrounds
var player = new Car(
  "images/car.png",
  canvas.width / 2 - carWidth,
  canvas.height / 2,
  true
); // Player's object
var speed = 6;

Start();

var animationId;

function Start() {
  if (!player.dead) {
    animationId = requestAnimationFrame(Update);
  }
}

function Stop() {
  cancelAnimationFrame(animationId);
  clearTimeout(obstacleGenerationTimeout);
  clearTimeout(coinGenerationTimeout);
  animationId = null;
  obstacleGenerationTimeout = null;
  coinGenerationTimeout = null;
}

function random1to3() {
  // случайное число от 1 до 3
  let rand = 1 + Math.random() * (3 + 1 - 1);
  return Math.floor(rand);
}

function randomLane() {
  const lane = random1to3();
  if (lane === 1) {
    return canvas.width / 6 - carWidth;
  }
  if (lane === 2) {
    return canvas.width / 2 - carWidth;
  }
  if (lane === 3) {
    return 2 * (canvas.width / 3) + canvas.width / 6 - carWidth;
  }
}

// ... (предыдущий код)

function generateObstacle() {
  if (objects.length < obstacleCount) {
    const lane = random1to3();
    const obstacleX = (lane === 1) ? canvas.width / 6 - carWidth :
                       (lane === 2) ? canvas.width / 2 - carWidth :
                                      2 * (canvas.width / 3) + canvas.width / 6 - carWidth;

    const obstacleY = getRandomHeight();

    if (!objects.some(obstacle => Math.abs(obstacle.x - obstacleX) < carWidth &&
                                   Math.abs(obstacle.y - obstacleY) < carHeight) &&
        !coins.some(coin => Math.abs(coin.x - obstacleX) < carWidth &&
                            Math.abs(coin.y - obstacleY) < carHeight)) {
      objects.push(
        new Car(
          "images/car_red.png",
          obstacleX,
          -700,
          false
        )
      );
    }
  }

  obstacleGenerationTimeout = setTimeout(generateObstacle, 1000); // Задержка в миллисекундах между генерациями
}

function generateCoin() {
  if (coins.length < obstacleCount) {
    const lane = random1to3();
    const coinX = (lane === 1) ? canvas.width / 6 - carWidth :
                   (lane === 2) ? canvas.width / 2 - carWidth :
                                  2 * (canvas.width / 3) + canvas.width / 6 - carWidth;

    const coinY = getRandomHeight();

    if (!coins.some(coin => Math.abs(coin.x - coinX) < carWidth &&
                            Math.abs(coin.y - coinY) < carHeight) &&
        !objects.some(obstacle => Math.abs(obstacle.x - coinX) < carWidth &&
                                  Math.abs(obstacle.y - coinY) < carHeight)) 
      coins.push(
        new Coin(
          "images/coin.png",
          coinX,
          RandomInteger(250, 400) * -1
        )
      );
    
  }

  coinGenerationTimeout = setTimeout(generateCoin, 1000); // Задержка в миллисекундах между генерациями
}

function getRandomHeight() {
  return -canvas.height * 0.5 + Math.random() * (canvas.height * 0.5);
}

function RandomInteger(min, max) {
	let rand = min - 0.5 + Math.random() * (max - min + 1);
	return Math.round(rand);
}

var obstacleGenerationTimeout;


function Update() {
  roads[0].Update(roads[1]);
  roads[1].Update(roads[0]);

	if (!obstacleGenerationTimeout) {
    generateObstacle(); // Запуск первой генерации
  }
	generateCoin();

  player.Update();

  if (player.dead) {
    Stop();
  }
	else if (player.paused) {
		Stop();
	}

  let isDead = false;

	let isCoinDead = false;

  for (let i = 0; i < objects.length; i++) {
    objects[i].Update();

    if (objects[i].dead) {
      isDead = true;
    }
  }

  if (isDead) {
    objects.shift();
  }

  for (let i = 0; i < coins.length; i++) {
    coins[i].Update();

    if (coins[i].dead) {
      isCoinDead = true;
    }
  }

  if (isCoinDead) {
    coins.shift();
  }

  let hit = false;

  for (let i = 0; i < objects.length; i++) {
    hit = player.Collide(objects[i]);

    if (hit) {
      Stop();
      player.dead = true;
			restartPage.classList.add('restart-page_active');
      break;
    }
  }

  for (let i = 0; i < coins.length; i++) {
    hit = player.Collide(coins[i]);

    if (hit) {
			scoreCount++;
			score.textContent = `Счёт: ${scoreCount}`;
      coins.splice(i, 1); // Удалить монетку при столкновении
			if (scoreCount === 10) {
				player.dead = true;
				Stop();
				scorePageText.textContent = `Поздравляю, ты собрал 10 канистр. Ускоряемся и скорее ждём тебя в уличных гонках!`;
				scorePage.classList.add('score-page_active');
			}
      break;
    }
  }

  Draw();
  if (!player.dead) {
    animationId = requestAnimationFrame(Update);
  }
}

function Draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clearing the canvas

  for (let i = 0; i < roads.length; i++) {
    ctx.drawImage(
      roads[i].image, // Image
      0, // First X on image
      0, // First Y on image
      roads[i].image.width, // End X on image
      roads[i].image.height, // End Y on image
      roads[i].x, // X on canvas
      roads[i].y, // Y on canvas
      canvas.width, // Width on canvas
      canvas.height // Height on canvas
    );
  }

  DrawCar(player);

  for (let i = 0; i < objects.length; i++) {
    DrawCar(objects[i]);
  }

  for (let i = 0; i < coins.length; i++) {
    DrawCar(coins[i]);
  }
}

function DrawCar(car) {
  ctx.drawImage(
    car.image,
    0,
    0,
    car.image.width,
    car.image.height,
    car.x,
    car.y,
    car.image.width * scale,
    car.image.height * scale
  );
}

function KeyDown(e) {
  switch (e.keyCode) {
    case 37:
      // Left
      player.Move("x", "left");
      break;

    case 39:
      // Right
      player.Move("x", "right");
      break;
  }
}

function ButtonDown(side) {
  switch (side) {
    case "left":
      player.Move("x", "left");
      break;
    case "right":
      player.Move("x", "right");
      break;
  }
}

function Restart() {
	// Сбросить счёт
  scoreCount = 0;
  score.textContent = 'Счёт: 0';

  // Очистить массивы объектов
  objects = [];
  coins = [];

  // Сбросить позицию игрока
  player.x = canvas.width / 2 - carWidth;
  player.y = canvas.height / 2;

  // Сбросить флаги
  player.dead = false;
  player.paused = false;
	speed = 6;

  // Запустить игру заново
  Start();
}

function Resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function setObstacleCount(newCount) {
  obstacleCount = newCount;
}

pauseBtn.addEventListener('click', () => {
  Stop();
  pausePage.classList.add('pause-page_active');
});

pausePageContinue.addEventListener('click', () => {
  pausePage.classList.remove('pause-page_active');
  setTimeout(() => {
    Start();
  }, 200)
});

pausePageRestart.addEventListener('click', () => {
	Restart();
	pausePage.classList.remove('pause-page_active');
});

scoreButton.addEventListener('click', () => {
	scorePage.classList.remove('score-page_active');
  setTimeout(() => {
		speed = 13;
		player.dead = false;
    Start();
  }, 200)
});

restartButton.addEventListener('click', () => {
	Restart();
	restartPage.classList.remove('restart-page_active');
});