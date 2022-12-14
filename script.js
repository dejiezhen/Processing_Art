
/*
This module explores the concept of soft fascination with 
color of noise. It uses processing to generate bubbles. 
The bubbles get connected if they are close enough. 
Pressing left click will change the noise.
Here are the benefits of each noise

White Noise: concentration for working and studying
Green Noise: calming effects for relaxation
Pink Noise: better sleep
Black Noise: silence total concentration
Brown Noise: relaxation, improved focus, better sleep

Author: Dejie Zhen
CSCI 3725
Date: December 14, 2022
*/

let currFascination = 0
let bubbles = []
let acceleration = 1
let noise
let paused
let canvas 

const fascinationColors = {
	0: ["rgb(0,100,0)", "Green.mp3"],
	1: ["rgb(255,255,255)", "White.mp3"],
	2: ["rgb(255,105,180)", "Pink.mp3"],
	3: ["rgb(139,69,19)", "Brown.mp3"],
	4: ["rgb(0,0,1)", undefined]
}

const bubbleColors = {
	0: "rgba(144,238,144,.85)",
	1: "rgba(245,245,245,.85)",
	2: "rgba(255,182,193,.85)",
	3: "rgba(160,82,45,.85)", 
	4: "rgba(255,255,255,.85)"
}

let mousePos = {
	x: null,
	y: null
}

function preload() {
	/*
	Preloading necessary files and details
	
	Args: 
		none
	*/
	soundFormats('mp3')
	let sound = fascinationColors[currFascination][1] || null
	if(sound) {
		noise = loadSound(sound)
	}
	righteous = loadFont('Righteous-Regular.ttf')
}

function getCurrNoise() {
	/*
	Get the current noise
	
	Args: 
		none
	*/
	return fascinationColors[currFascination][1]
}

function setup() {
	/*
	Setting up the canvas
	
	Args: 
		none
	*/
	canvas = createCanvas(window.innerWidth, window.innerHeight)
	paused = false
	if (currFascination > 4) {
		currFascination = 0
	}
	noise.loop()
	setBackgroundColor()
}

function windowResized() {
	/*
	Adjust the window width and height
	
	Args: 
		none
	*/
	resizeCanvas(window.innerWidth, window.innerHeight)
}


function mouseMoved(event) {
	/*
	Updates mouse x and y position
	
	Args: 
		event
	*/
	mousePos.x = event.x
	mousePos.y = event.y
}

setInterval(function() {
	/*
	Sets mouse x and y position when cursor stops
	moving
	
	Args: 
		none
	*/
	mousePos.x = undefined
	mousePos.y = undefined
}, 10)

function getFascinationColor() {
	/*
	Get current fascination color
	
	Args: 
		none
	*/
	return fascinationColors[currFascination][0]
}

function getBubbleColor() {
	/*
	Get current bubble color based on current fascination
	
	Args: 
		none
	*/
	return bubbleColors[currFascination]
}

function setBackgroundColor() {
	/*
	Setting the background color
	
	Args: 
		none
	*/
	currFascinationColor = getFascinationColor()
	background(currFascinationColor)
	colorMode(HSB)
}

function loadSuccess() {
	/*
	Success callback function when
	switching audio
	
	Args: 
		none
	*/
	noise.connect()
	setup()
}

function mousePressed() {
	/*
	Changes fascination color and noise
	on left mouse click
	
	Args: 
		none
	*/
	currFascination++
	bubbles = []
	noise.disconnect()
	if (currFascination > 4) {
		currFascination = 0
	}
	let sound = fascinationColors[currFascination][1] || null
	if (sound) {
		noise = loadSound(sound, loadSuccess)
	}
}

function distanceFormula(i, j) {
	/*
	Formula to calculate distance between bubbles
	
	Args: 
		i(num): current bubble
		j(num): other bubbles
	*/
	return Math.sqrt(Math.pow((bubbles[i].x - bubbles[j].x), 2) + Math.pow(((bubbles[i].y - bubbles[j].y)), 2))
}

function connectBubbles() {
	/*
	Connects a line between bubbles that 
	are close together
	
	Args: 
		none
	*/
	let opacity = 1
	for (let i = 0; i < bubbles.length; i++) {
		for (let j = i; j < bubbles.length; j++) {
			let distance = distanceFormula(i,j);
			if(distance < 75) {
				opacity = 1 - (distance / 100)
				stroke('black')
				line(bubbles[i].x, bubbles[i].y, bubbles[j].x, bubbles[j].y)
			}
		}
	}
}

function cleanBubbles() {
	/*
	Cleans and updates the bubble array
	so we do not have dead classes
	
	Args: 
		none
	*/
	currBubbles = []
	bubbles.forEach(bubble => {
		if (bubble.bubbleLife < bubble.lifespan) {
			currBubbles.push(bubble)
		}
	})
	bubbles = currBubbles
}

function keyPressed() {
	/*
	Handles all the key presses. 
	Up for acceleration, down for deceleration,
	P for pausing the screen. Press any key
	to unpause
	S for screenshot
	
	Args: 
		none
	*/
	if (keyCode === UP_ARROW) {
		acceleration+=0.35
	}
	if (keyCode === DOWN_ARROW) {
		acceleration-=0.35
	}
	// "P" == 80
	if (keyCode === 80) {
		paused = true
		noise.pause()
	} else {
		paused = false
		noise.loop()
	}
	// "S" == 83
	if (keyCode === 83) {
		save(canvas, 'SoftFascination.jpg')
	}
}

function textFill() {
	/*
	Fills the canvas with instructions
	when mouse hovers over center of the page
	
	Args: 
		none
	*/
	distance = Math.sqrt(Math.pow((mousePos.x - windowWidth/2), 2) + Math.pow((mousePos.y - windowHeight/2), 2))
	if (distance < 200) {
		fill('orange')
		textFont(righteous)
		text("Left Click to Change Noise", windowWidth - 200, windowHeight - 125)
		text("Pause with P", windowWidth - 200, windowHeight - 100)
		text("Screenshot with S", windowWidth - 200, windowHeight - 75)
		text("Accelerate ^ Decelerate v", windowWidth - 200, windowHeight - 50)
	}
}

function draw() {
	/*
	Draws bubbles and update bubble movement on the screen.
	Also sets the background color and text fill. 
	If the cursor is not moving, the bubbles will free roam.
	IF the user is moving the cursor, each bubble will
	have a lifespan
	
	Args: 
		none
	*/
	if (!paused) {
		setBackgroundColor()
		textFill()
		if ((mousePos.x == undefined) && (mousePos.y == undefined)) {
			bubbles.forEach(bubble => {
				bubble.move()
				bubble.checkBounds()
				bubble.draw()
				connectBubbles()
			})
		}
		else {
			bubbles.push(new Bubbles(mousePos.x, mousePos.y))
			bubbles.forEach(bubble => {
					bubble.updateLife()
					bubble.move()
					bubble.checkBounds()
					connectBubbles()
					bubble.draw()
			})
			cleanBubbles()
		}
	}
}

class Bubbles {
	constructor(x, y) {
		/*
		Bubbles class that creates bubbles and 
		updates their movement.

		Args: 
			x(float): current mouse x position
			y(float): current mouse y position
		*/
		this.x = x
		this.y = y
		this.size = random(20,80)
		this.vx = random(-1, 1)
		this.vy = random(-1, 1)
		this.bubbleLife = 0
		this.lifespan = random(75, 125)
	}

	move() {
		/*
		Moves the bubbles on the screen

		Args: 
			none
		*/
		this.x += this.vx * acceleration
		this.y += this.vy * acceleration
	}

	draw() {
		/*
		Draws the bubbles on the screen if
		it has not reached its lifespan

		Args: 
			none
		*/
		if (this.bubbleLife < this.lifespan) {
			fill(getBubbleColor())
			noStroke()
			ellipse(this.x, this.y, this.size, this.size)
		}
	}

	checkBounds() {
		/*
		Checks if the bubbles are hitting the bounds
		and deflect if they did

		Args: 
			none
		*/
		if (this.x >= windowWidth - this.size * 2 ||
			this.x <= 0) {
			this.vx *= -1
		}
		if (this.y >= windowHeight - this.size * 2 ||
			this.y <= 0) {
			this.vy *= -1
		}
	}

	updateLife() {
		/*
		Updates the bubble's life spabn

		Args: 
			none
		*/
		this.bubbleLife++
	}
}