import { Q5 as p5 } from "./lib/q5/q5.js";
import { reactive } from "./lib/chowk.js";
import { dom } from "./lib/dom.js";

let container = [".q5"];

let color1 = "";
let color2 = "";
let color3 = "";

let width = window.innerWidth;
let height = window.innerHeight;
let downscale = 9;

let v = (x, y) => ({ x, y });

let sensorAngle = 45;
let sensorDist = 15;
let rotationAngle = sensorAngle;

function createGrid(width, cellSize) {
	const cellsPerRow = Math.floor(width / cellSize);
	const totalCells = cellsPerRow * cellsPerRow;

	// initialize grid
	const grid = new Array(totalCells).fill(null).map((_, index) => {
		const x = index % cellsPerRow;
		const y = Math.floor(index / cellsPerRow);

		return {
			x: x * cellSize,
			y: y * cellSize,
			size: cellSize,
			brightness: Math.random() * .1,
			marked: true,
		};
	});

	function getCell(px, py) {
		if (
			px < 0 ||
			py < 0 ||
			px >= width ||
			py >= width
		) {
			return null;
		}

		const cellX = Math.floor(px / cellSize);
		const cellY = Math.floor(py / cellSize);
		const index = cellY * cellsPerRow + cellX;

		return grid[index];
	}

	function iterate(fn) {
		grid.forEach(fn);
	}

	// closure function
	return { getCell, iterate };
}

let pixies = createGrid(width, downscale);

let mold = () => {
	let x = Math.random() * width;
	let y = Math.random() * height;
	let r = 10;
	let dist = sensorDist;
	let heading = Math.random() * 360;

	let vx = Math.cos(heading);
	let vy = Math.sin(heading);

	let sensorLeftPos = v(0, 0);
	let sensorRightPos = v(0, 0);
	let sensorFrontPos = v(0, 0);

	let update = (p) => {
		vx = Math.cos(heading) * dist;
		vy = Math.sin(heading) * dist;

		x = x + vx;
		y = y + vy;

		if (x > width) x = x - width + 100;
		if (y > height) y = y - height + 100;

		if (x < 0) x = x * -1 + 100;
		if (y < 0) y = y * -1 + 100;

		let cell = pixies.getCell(x, y);
		if (
			cell &&
			!cell.marked
		) cell.brightness = 1;
		// if (cell && cell.marked) cell.brightness = .2;

		sensorRightPos.x = x + sensorDist * Math.cos(heading + sensorAngle);
		sensorRightPos.y = y + sensorDist * Math.sin(heading + sensorAngle);

		sensorLeftPos.x = x + sensorDist * Math.cos(heading - sensorAngle);
		sensorLeftPos.y = y + sensorDist * Math.sin(heading - sensorAngle);

		sensorFrontPos.x = x + sensorDist * Math.cos(heading);
		sensorFrontPos.y = y + sensorDist * Math.sin(heading);

		let rpix = pixies.getCell(sensorRightPos.x, sensorRightPos.y);
		let lpix = pixies.getCell(sensorLeftPos.x, sensorLeftPos.y);
		let fpix = pixies.getCell(sensorFrontPos.x, sensorFrontPos.y);

		let rpixB = rpix ? rpix.brightness : 0;
		let lpixB = lpix ? lpix.brightness : 0;
		let fpixB = fpix ? fpix.brightness : 0;

		if (fpixB > rpixB && fpixB > lpixB) { }
		else if (fpixB < rpixB && fpixB < lpixB) {
			if (Math.random() > .5) heading += rotationAngle;
			else heading -= rotationAngle;
		} else if (rpixB > lpixB) heading += rotationAngle;
		else if (rpixB < lpixB) heading -= rotationAngle;
	};

	let draw = (p) => {
		p.fill(255);
		p.ellipse(x, y, r);

		// p.stroke(255);
		// p.line(x, y, x + dist * vx, y + dist * vy);

		p.fill(255, 0, 0);
		p.line(x, y, sensorRightPos.x, sensorRightPos.y);
		p.ellipse(sensorRightPos.x, sensorRightPos.y, r);

		p.line(x, y, sensorLeftPos.x, sensorLeftPos.y);
		p.ellipse(sensorLeftPos.x, sensorLeftPos.y, r);

		p.fill(255, 255, 0);
		p.line(x, y, sensorFrontPos.x, sensorFrontPos.y);
		p.ellipse(sensorFrontPos.x, sensorFrontPos.y, r);

		p.text("X: " + Math.floor(x), x + 10, y);
		p.text("Y: " + Math.floor(y), x + 10, y + 10);
	};

	return { draw, update };
};

function init() {
	let el = dom(container);
	document.body.appendChild(el);
	let p = new p5("instance", el);

	let molds = Array(60).fill(0).map((e) => mold());
	let textPoints = [];
	let alphabetPoints = {};
	let font;

	p.preload = () => {
		// font = p.loadFont("./fs/fonts/GapSansBlack.ttf");
		console.log(font);
	};

	let pointsss;
	let setGrid = (points) => {
		pointsss = points;
		pixies.iterate((e) => e.marked = true);
		points.forEach((e) => {
			let pix = pixies.getCell(e.x, e.y);
			if (pix) pix.marked = false;
			// else pix.marked = true;
		});
	};

	p.setup = () => {
		p.createCanvas(window.innerWidth, window.innerHeight);
		p.textFont("Times");
		p.frameRate(60);
		p.textSize(454);
		let word =
			"book ----- making ----- as meditative ----- practice as an excuse ----- to make books with friends as friends who love to meditate";
		Array.from(new Set(word.split(" "))).forEach((letter) => {
			alphabetPoints[letter] = p.textToPoints(letter, 100, 856, .1, .5);
		});

		let letters = word.split(" ");
		let index = 0;
		setInterval(() => {
			setGrid(alphabetPoints[letters[index % letters.length]]);
			index++;
		}, 3000);
		p.textFont("monospace");
		p.textSize(downscale);
	};

	let pressed = false;

	setTimeout(() => {
		p.mousePressed = () => {
			pressed = true;
		};

		p.mouseReleased = () => {
			pressed = false;
		};

		p.keyPressed = () => {
			if (p.key == "ArrowUp") rotationAngle += 1;
			if (p.key == "ArrowDown") rotationAngle -= 1;
		};

		p.draw = () => {
			p.background(255);

			if (pressed) {
				let pix = pixies.getCell(p.mouseX, p.mouseY);
				if (pix) pix.brightness = 1;
			}
			molds.forEach((m) => m.update(p));

			let last;
			pixies.iterate((pix) => {
				let chars = [".", ":", "-", "=", "+", "*", "#", "%"];
				// chars = [".", "\\", " | ", "=", " - ", " / "];
				chars = ["c", "f", "u", "l", ">", ")", "))"];
				// chars = ["c", "(", "-", "--", ">", ")"];
				// p.textSize((pix.brightness) * 24);
				// if (pix.brightness < .3) p.fill((pix.brightness) * 155, 155, 0);
				// p.fill(255);
				let char = chars[Math.floor(pix.brightness * chars.length)];
				// char = "/";

				if (pix.brightness > 0) {
					if (pix.brightness > .9) {
						p.fill(455 - ((pix.brightness) * 255));
						p.fill(255);
						p.stroke(0);
						p.strokeWeight(pix.brightness * 2 + 1);
						p.ellipse(pix.x, pix.y, downscale * 1.1);
					} // else if (pix.brightness > .6) {
					// 	p.fill(155 - ((pix.brightness) * 255));
					// 	p.stroke(0);
					//
					// 	p.textSize(24);
					//
					// 	p.text(char, pix.x, pix.y);
					// }
					else {
						p.fill(55 - ((pix.brightness) * 255));
						p.strokeWeight(2.5);
						p.stroke(0);
						p.text(char, pix.x, pix.y);
					}
					// p.fill(0);
					//
					if (last) {
						let diffX = p.abs(pix.x - last.x);
						let diffY = p.abs(pix.y - last.y);

						if (diffX < 55 && diffX > 15 && diffY < 55) {
							// p.line(last.x, last.y, pix.x, pix.y);
							p.noFill();
							p.curve(
								last.x - 40,
								last.y + 45,
								last.x,
								last.y,
								pix.x,
								pix.y,
								pix.x + 40,
								pix.y + 45,
							);
						}
						p.strokeWeight(1);
					}

					last = pix;
				}

				pix.brightness -= .015;
			});

			textPoints.forEach((e) => {
				p.fill(255);
			});

			p.text("ANGLE: " + rotationAngle, 10, 10);

			p.fill(200);
			if (Array.isArray(pointsss)) {
				pointsss.forEach((m) => p.ellipse(m.x, m.y, 2));
			}
			// molds.forEach((m) => m.draw(p));
		};
	}, 150);
	// p.setup = () => {
	// };
}

init();
