import { Q5 as p5 } from "./lib/q5/q5.js";
import { reactive } from "./lib/chowk.js";
import { dom } from "./lib/dom.js";

let container = [".q5"];

let width = window.innerWidth;
let height = window.innerHeight;
let downscale = 12;

let v = (x, y) => ({ x, y });

let sensorAngle = 39;
let sensorDist = 50;
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
			brightness: Math.random(),
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
	let dist = 15;
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
		if (cell && !cell.marked) cell.brightness = 1;

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

		p.stroke(255);
		p.line(x, y, x + dist * vx, y + dist * vy);

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

	let molds = Array(150).fill(0).map((e) => mold());
	let textPoints = [];
	let font;

	p.preload = () => {
		font = p.loadFont("./fs/fonts/GapSans.ttf");
		console.log(font);
	};

	p.setup = () => {
		p.createCanvas(window.innerWidth, window.innerHeight);
		p.textFont(font);
		p.frameRate(60);
		p.textSize(454);
		textPoints = p.textToPoints("BOOK", 100, 856, .1, .5);
		textPoints.forEach((e) => {
			let pix = pixies.getCell(e.x, e.y);
			if (pix) pix.marked = false;
		});
		p.textSize(7);
	};

	setTimeout(() => {
		p.draw = () => {
			p.background("black");

			molds.forEach((m) => m.update(p));

			pixies.iterate((pix) => {
				p.stroke(255);
				p.noStroke();

				let chars = [".", ":", "-", "=", "+", "*", "#", "%", "@"];
				p.fill((pix.brightness + .2) * 255);
				// p.fill(255);
				let char = chars[Math.floor(pix.brightness * chars.length)];

				if (pix.brightness > 0) {
					// p.ellipse(pix.x, pix.y, downscale);
					p.text(char, pix.x, pix.y);
				}
				pix.brightness -= .01;
			});

			textPoints.forEach((e) => {
				p.fill(255);
			});
		};
	}, 150);
	// p.setup = () => {
	// };
}

init();
