var canvas = document.getElementById("banvas");
canvas.width = 350;
canvas.height = 350;

var c = canvas.getContext('2d');

var arry = [];
var trail = [];
c.fillStyle = "white";


function Ball(x,y){
	this.x = x;
	this.y = y;
	this.xvelocity = Math.random() * 6;
	this.yvelocity = Math.random() * 6;
	this.radius = 30;
	this.start = 0;
	this.end = 2 * Math.PI;
	this.r = Math.round(255 * Math.random());
	this.g = Math.round(255 * Math.random());
	this.b = Math.round(255 * Math.random());
	this.alpha = 1;
}

$("#banvas").click(function(event){
	//mouse
	arry.push(new Ball(event.clientX,event.clientY - 230));
	console.log(event.clientX, event.clientY);
})



function animate(){
	c.clearRect(0,0,canvas.width,canvas.height);
	requestAnimationFrame(animate);
	c.beginPath();
	for(i = 0; i < arry.length; i++){
		c.arc(arry[i].x, arry[i].y, arry[i].radius, arry[i].start, arry[i].end, false);
		
		c.closePath();
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
function resetcanvas(){
	arry = [];
}


animate();