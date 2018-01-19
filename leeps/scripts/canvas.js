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
	
	c.arc(dankman.x, dankman.y, dankman.radius, dankman.start, dankman.end, false);
	c.fill();

if(dankman.x + 30 >= 350){
	dankman.xvelocity *= -1;
}
if(dankman.x <= 30){
	dankman.xvelocity *= -1;

}
if(dankman.y + 30 >= 350) {
	dankman.yvelocity *= -1;
}
if(dankman.y <= 30){
	dankman.yvelocity *= -1;

}
console.log(x);
dankman.x += dankman.xvelocity;
dankman.y += dankman.yvelocity;

}


animate();