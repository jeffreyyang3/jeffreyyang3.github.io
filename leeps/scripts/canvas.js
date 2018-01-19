var canvas = document.querySelector("canvas");
console.log(canvas);
canvas.width = 350;
canvas.height = 350;
var x = 200
var y = 200
var xvelocity = Math.random() * 6;
var yvelocity = Math.random() * 6;
var c = canvas.getContext('2d');
var dankman = new Ball(200,200);
var bonkman = new Ball(300,300);
var donkman = new Ball(100,100);
var bingman = new Ball(250,250);
var arry = [dankman, bonkman, donkman, bingman];
c.fillStyle = "white";
function Ball(x,y){
	this.x = x;
	this.y = y;
	this.xvelocity = Math.random() * 6;
	this.yvelocity = Math.random() * 6;
	this.radius = 30;
	this.start = 0;
	this.end = 2 * Math.PI;
	this.ccw = false;
}



function animate(){
	c.clearRect(0,0,canvas.width,canvas.height);
	requestAnimationFrame(animate);
	c.beginPath();
	for(i = 0; i < arry.length; i++){
		c.arc(arry[i].x, arry[i].y, arry[i].radius, arry[i].start, arry[i].end, false);
		c.fill();

		if(arry[i].x + 30 >= 350){
			arry[i].xvelocity *= -1;
		}
		if(arry[i].x <= 30){
			arry[i].xvelocity *= -1;

		}
		if(arry[i].y + 30 >= 350) {
			arry[i].yvelocity *= -1;
		}
		if(arry[i].y <= 30){
			arry[i].yvelocity *= -1;

		}
		arry[i].x += arry[i].xvelocity;
		arry[i].y += arry[i].yvelocity;
	}
	

}


animate();