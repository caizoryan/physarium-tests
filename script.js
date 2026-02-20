import { Q5 as p5 } from "./lib/q5/q5.js";
import { reactive } from "./lib/chowk.js";
import { dom } from "./lib/dom.js";

let container = [".q5"];

let v = (x, y) => ({ x, y });

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
	return { getCell, iterate, data: grid };
}

let state = {};

state.loaded = 0;
state.colors = ["yellow", "blue", "red"];
state.colors = ["#0468AF", "#058EF0", "#4BB2FB"];
state.colors = ["#025002", "#119711", "#35BB35"];

state.chars = [".", ":", "-", "=", "+", "*", "#", "%"];
// state.chars = ["c", "f", "u", "l", ">", ")", "))"];
state.chars = "/|\\xo-.+=".split("");
state.moldCount = 85;

state.width = window.innerWidth;
state.height = window.innerHeight;

// state.width = 712;
// state.height = 712;

state.x = 100;
state.y = 482;

state.textSize = 400;

state.size = 10;
state.sensorAngle = 45;
state.sensorDist = 35;
state.rotationAngle = state.sensorAngle;
state.grid = createGrid(state.width, state.size);
state.decay = .015;
state.currentWord = "";

let mold = () => {
	let x = Math.random() * state.width;
	let y = Math.random() * state.height;
	let r = 10;
	let dist = state.sensorDist;
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

		if (x > state.width) x = x - state.width + 100;
		if (y > state.height) y = y - state.height + 100;

		if (x < 0) x = x * -1 + 100;
		if (y < 0) y = y * -1 + 100;

		let cell = state.grid.getCell(x, y);
		if (cell && !cell.marked) cell.brightness = 1;

		sensorRightPos.x = x +
			state.sensorDist * Math.cos(heading + state.sensorAngle);
		sensorRightPos.y = y +
			state.sensorDist * Math.sin(heading + state.sensorAngle);

		sensorLeftPos.x = x +
			state.sensorDist * Math.cos(heading - state.sensorAngle);
		sensorLeftPos.y = y +
			state.sensorDist * Math.sin(heading - state.sensorAngle);

		sensorFrontPos.x = x + state.sensorDist * Math.cos(heading);
		sensorFrontPos.y = y + state.sensorDist * Math.sin(heading);

		let rpix = state.grid.getCell(sensorRightPos.x, sensorRightPos.y);
		let lpix = state.grid.getCell(sensorLeftPos.x, sensorLeftPos.y);
		let fpix = state.grid.getCell(sensorFrontPos.x, sensorFrontPos.y);

		let rpixB = rpix ? rpix.brightness : 0;
		let lpixB = lpix ? lpix.brightness : 0;
		let fpixB = fpix ? fpix.brightness : 0;

		if (fpixB > rpixB && fpixB > lpixB) { }
		else if (fpixB < rpixB && fpixB < lpixB) {
			if (Math.random() > .5) heading += state.rotationAngle;
			else heading -= state.rotationAngle;
		} else if (rpixB > lpixB) heading += state.rotationAngle;
		else if (rpixB < lpixB) heading -= state.rotationAngle;
	};

	let draw = (p) => {
		p.fill(255);
		p.ellipse(x, y, r);

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

	let molds = Array(state.moldCount).fill(0).map((e) => mold());

	let alphabetPoints = {};
	// let alphabetOutlinePoints = {};
	let pointsss;
	// let pointsssOutline;

	let setGrid = (word) => {
		state.loaded = 0;
		state.currentWord = word;

		p.textFont("Times");
		p.textSize(state.textSize);
		p.noStroke();
		p.fill(0);

		pointsss = p.textToPoints(word, state.x, state.y, .1, .5);

		// pointsssOutline = pointsOutline;
		state.grid.iterate((e) => e.marked = true);
		pointsss.forEach((e) => {
			let pix = state.grid.getCell(e.x, e.y);
			if (pix) pix.marked = false;
		});

		p.textSize(state.size);
	};

	p.setup = () => {
		p.createCanvas(state.width, state.height);
		p.frameRate(40);
		let word =
			"book making as meditative practice as excuse to make books with friends as friends who love to meditate";

		let letters = word.split(" ");
		let index = 0;

		setInterval(() => {
			setGrid(
				letters[index % letters.length],
			);
			index++;
		}, 5000);

		p.textFont("monospace");
		p.textSize(state.size * 1.5);

		p.filter(p.BLUR, 3);
	};

	let pressed = false;

	let saveData = (json, file = "data") => {
		let a = document.createElement("a");
		var json = JSON.stringify(json),
			blob = new Blob([json], { type: "octet/stream" }),
			url = window.URL.createObjectURL(blob);
		a.href = url;
		a.download = file + ".json";
		a.click();
		window.URL.revokeObjectURL(url);
	};

	setTimeout(() => {
		p.mousePressed = () => {
			pressed = true;
			console.log(state.grid.data);
			saveData(
				{
					grid: state.grid.data,
					points: pointsss,
				},
				state.currentWord,
			);
		};

		p.mouseReleased = () => {
			pressed = false;
		};

		p.draw = () => {
			p.background(255);

			if (pressed) {
				let pix = state.grid.getCell(p.mouseX, p.mouseY);
				if (pix) pix.brightness = 1;
			}

			molds.forEach((m) => m.update(p));

			let last;
			state.grid.iterate((pix) => {
				let char = state.chars[Math.floor(pix.brightness * state.chars.length)];
				// char = "/";

				if (pix.brightness > 0) {
					if (pix.brightness > .9) {
						// p.fill(455 - ((pix.brightness) * 255));
						// p.fill(255);
						p.fill(state.colors[1]);
						p.stroke(state.colors[1]);
						p.strokeWeight(pix.brightness * 2 + 1);
						p.ellipse(pix.x, pix.y, state.size * .8);
					} else {
						// p.fill(55 - ((pix.brightness) * 255));
						p.fill(state.colors[2]);
						p.strokeWeight(2.5);
						p.stroke(state.colors[2]);
						p.text(char, pix.x, pix.y);
					}

					p.noFill();
					p.stroke(state.colors[0]);
					if (last) {
						let diffX = p.abs(pix.x - last.x);
						let diffY = p.abs(pix.y - last.y);

						if (diffX < 55 && diffX > 15 && diffY < 55) {
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

				pix.brightness -= state.decay;
			});

			p.text("ANGLE: " + state.rotationAngle, 10, 10);

			if (Array.isArray(pointsss)) {
				p.fill(state.colors[1]);
				p.noStroke();
				state.loaded += 65;
				pointsss.forEach((m, i) => {
					if (i > state.loaded) return;
					p.ellipse(m.x, m.y, 3);
				});

				// let lastPoint;
				// pointsssOutline.forEach((m, i) => {
				// 	p.noFill();
				// 	p.stroke(state.colors[1]);
				// 	if (lastPoint) {
				// 		let diffX = p.abs(m.x - lastPoint.x);
				// 		let diffY = p.abs(m.y - lastPoint.y);
				//
				// 		if (diffX < 45 && diffX > 15 && diffY < 45) {
				// 			p.curve(
				// 				lastPoint.x - 40,
				// 				lastPoint.y + 45,
				// 				lastPoint.x,
				// 				lastPoint.y,
				// 				m.x,
				// 				m.y,
				// 				m.x + 40,
				// 				m.y + 45,
				// 			);
				// 		}
				// 		p.strokeWeight(1);
				// 	}
				//
				// 	lastPoint = m;
				// });
			}
			// molds.forEach((m) => m.draw(p));
		};
	}, 15);
}

init();
