//Declare variables to be used to reference the canvas contexts, and a variable to be used to store calculated points
var context;
var animationcontext;
var points;
//Instantiate an instance of Vue
var app = new Vue({
    el: '#vueElement',
    data: {
		drawColors: true,
		degrees: 90,
		lineLength: 6,
		speed: 1,
		iterations: 10,
		startingPositionX: 250,
		startingPositionY: 250,
		turns: [],
		angleOfRotation: 0,
		complementaryAngleOfRotation: 0,
		previousX: 0,
		previousY: 0,
		currentX: 0,
		currentY: 0,
		nextX: 0,
		nextY: 0,
		numberOfLinesDrawn: 0,
		numberOfIterationsPerformed: 0,
		lengthOfIteration: 0,
		numberOfLinesAnimated: 0,
		numberOfIterationsAnimated: 0,
		lengthOfAnimatedIteration: 0,
		totalNumberOfTurns: 0
	},
	directives: {
		canvas: function (el) {
			context = el.getContext("2d");
		},
		animationcanvas: function (el) {
			animationcontext = el.getContext("2d");
		}
	},
    methods: {
        draw: function () {
			//Reset counts
			this.numberOfLinesDrawn = 0;
			this.numberOfIterationsPerformed = 0;
			this.lengthOfIteration = 1;
			this.numberOfLinesAnimated = 0;
			this.numberOfIterationsAnimated = 0;
			this.lengthOfAnimatedIteration = 1;
			this.totalNumberOfTurns = Math.pow(2, this.iterations);
			points = [];
			//Clear the canvases
			context.clearRect(0, 0, 525, 525);
			animationcontext.clearRect(0, 0, 525, 525);
			//Calculate angles of rotation for given degree
			var degree = this.degrees;
			var complementaryDegree = 360 - degree;
			this.angleOfRotation = degree * (Math.PI / 180);
			this.complementaryAngleOfRotation = complementaryDegree * (Math.PI / 180);
			this.previousX = this.startingPositionX;
			this.previousY = this.startingPositionY;
			this.currentX = this.startingPositionX + this.lineLength;
			this.currentY = this.startingPositionY;
			points.push([this.previousX,this.previousY]);
			points.push([this.currentX,this.currentY]);
			this.dispaly();
		},
		dispaly: function () {
			//Make sure to stop drawing once all lines have been drawn
			while(this.numberOfLinesDrawn <= this.totalNumberOfTurns) {
				//Calculate new point
				//Determine the length and direction from the previous point to the current point, and set the next point to extend the line for the same length in the same direction
				var dx = this.currentX - this.previousX;
				var dy = this.currentY - this.previousY;
				var nextXbeforerotation = this.currentX + dx;
				var nextybeforerotation = this.currentY + dy;
				//Translate the next point so that it's position relative to the previous point becomes it's position relative to the origin
				nextXbeforerotation -= this.currentX;
				nextybeforerotation -= this.currentY;
				//Rotate the next point appropriately	
				if(!this.turns[this.numberOfLinesDrawn]) {
					this.nextX = nextXbeforerotation * Math.cos(this.angleOfRotation) - nextybeforerotation * Math.sin(this.angleOfRotation);
					this.nextY = nextXbeforerotation * Math.sin(this.angleOfRotation) + nextybeforerotation * Math.cos(this.angleOfRotation);
				} else {
					this.nextX = nextXbeforerotation * Math.cos(this.complementaryAngleOfRotation) - nextybeforerotation * Math.sin(this.complementaryAngleOfRotation);
					this.nextY = nextXbeforerotation * Math.sin(this.complementaryAngleOfRotation) + nextybeforerotation * Math.cos(this.complementaryAngleOfRotation);
				}
				//Translate the rotated next point so that it's position relative to the origin becomes it's position relative to the previous point
				this.nextX += this.currentX;
				this.nextY += this.currentY;
				//Draw curve
				context.beginPath();
				if(this.numberOfLinesDrawn == 0) {
					context.moveTo(this.previousX,this.previousY);
					context.lineTo(this.currentX,this.currentY);
					context.lineTo(this.nextX,this.nextY);
				} else {
					context.moveTo(this.currentX,this.currentY);
					context.lineTo(this.nextX,this.nextY);
				}
				context.stroke();
				points.push([this.nextX,this.nextY]);
				//var url = canvas.toDataURL();
				//Shift points
				this.previousX = this.currentX;
				this.previousY = this.currentY;
				this.currentX = this.nextX;
				this.currentY = this.nextY;
				//Update output results
				this.numberOfLinesDrawn++;
				if(this.numberOfLinesDrawn == this.lengthOfIteration) {
					this.numberOfIterationsPerformed++;
					this.lengthOfIteration = (this.lengthOfIteration * 2) + 1;
				}
			}
			this.previousX = this.startingPositionX;
			this.previousY = this.startingPositionY;
			this.currentX = this.startingPositionX + this.lineLength;
			this.currentY = this.startingPositionY;
			window.requestAnimationFrame(this.animate);
		},
		animate: function () {
			//Draw curve
			try {
				animationcontext.beginPath();
				if(this.numberOfLinesAnimated == 0) {
					animationcontext.moveTo(points[0][0],points[0][1]);
					animationcontext.lineTo(points[1][0],points[1][1]);
					animationcontext.lineTo(points[2][0],points[2][1]);
				} else {
					animationcontext.moveTo(points[this.numberOfLinesAnimated+1][0],points[this.numberOfLinesAnimated+1][1]);
					animationcontext.lineTo(points[this.numberOfLinesAnimated+2][0],points[this.numberOfLinesAnimated+2][1]);
				}
				animationcontext.stroke();
			} catch (error) {
				console.log('requestAnimationFrame completed before Vue updated the "numberOfLinesAnimated" reactive property');
			}
			//Update output results
			this.numberOfLinesAnimated++;
			if(this.numberOfLinesAnimated == this.lengthOfAnimatedIteration) {
				this.numberOfIterationsAnimated++;
				this.lengthOfAnimatedIteration = (this.lengthOfAnimatedIteration * 2) + 1;
			}
			//Continue animation
			if(this.numberOfLinesAnimated <= this.totalNumberOfTurns){
				window.requestAnimationFrame(this.animate);
			} else {
				this.numberOfLinesAnimated = this.numberOfLinesDrawn;
			}
		}
	},
	mounted: function () {
		//Hard code the maximum iterations to calculate (13 is chosen for performance, 26 is the objective limit based on the size of a javascript array)
		var maxIterations = 13;
		//First iteration
		this.turns = [];
		this.turns.push(true);
		this.lengthOfIteration = 1;
		//Calculate turns - 1=left, 0=right
		for(var i=0; i<maxIterations-1; i++) {
			var duplicate = this.turns.slice(0);
			this.turns.push(true);
			for(var j=duplicate.length-1; j>=0; j--) {
				if (duplicate[j])
					this.turns.push(false);
				else
					this.turns.push(true);
			}
		}
		this.draw();
	}
});