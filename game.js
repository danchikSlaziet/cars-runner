let carWidth = 201 * 0.14;
let obstacleCount = 3;
const pauseBtn = document.querySelector('.pause');
const pausePage = document.querySelector('.pause-page');
const pausePageContinue = pausePage.querySelector('.pause-page__btn_continue');
const arrowLeft = document.querySelector('.arrow-btn_left');
const arrowRight = document.querySelector('.arrow-btn_right');

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

	Move(v, direction) {
			if (v == "x") {
					const step = canvas.width / 3;
					// Moving on x
					if (direction == "left") {
						if (this.x < 130) {
							return
						}
						else {
							this.x -= step;
						}
					}
					if (direction == "right") {
						this.x += step;
					}

					// Rolling back the changes if the car left the screen
					if (this.x + this.image.width * scale > canvas.width) {
							this.x -= step;
					}

					if (this.x < 0) {
							this.x = 0;
					}
			}
	}
}

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
    animationId = null;
}

function random1to3() {
  // случайное число от 1 до (3+1)
  let rand = 1 + Math.random() * (3 + 1 - 1);
  return Math.floor(rand);
}

function randomLane() {
	const lane = random1to3();
	if (lane === 1) {
		return (canvas.width/6 - carWidth );
	}
	if (lane === 2) {
		return (canvas.width/2 - carWidth);
	}
	if (lane === 3) {
		return (2*(canvas.width/3) + canvas.width/6 - carWidth);
	}
}

function Update() {
	roads[0].Update(roads[1]);
	roads[1].Update(roads[0]);

	if (RandomInteger(0, 10000) > 9750) {
			// Generating new car
			objects.push(
				new Car(
					"images/car_red.png",
					randomLane(),
					RandomInteger(250, 400) * -1,
					false
				)
			);
	}
	player.Update();

	if (player.dead) {
			Stop();
	}

	var isDead = false;

	for (var i = 0; i < objects.length; i++) {
			objects[i].Update();

			if (objects[i].dead) {
					isDead = true;
			}
	}

	if (isDead) {
			objects.shift();
	}

	var hit = false;

	for (var i = 0; i < objects.length; i++) {
			hit = player.Collide(objects[i]);

			if (hit) {
					Stop();
					player.dead = true;
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

	for (var i = 0; i < roads.length; i++) {
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

	for (var i = 0; i < objects.length; i++) {
			DrawCar(objects[i]);
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

function Resize() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

function RandomInteger(min, max) {
	let rand = min - 0.5 + Math.random() * (max - min + 1);
	return Math.round(rand);
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