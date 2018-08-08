var canvas = document.querySelector('canvas')
var ctxt = canvas.getContext('2d')
// fillRect x,y,width,height
var W = canvas.width = window.innerWidth;
var H = canvas.height = window.innerHeight - 50;
// arc x,y,radius, startangle, endangle (radians), drawccw
var vx = 0;
// Velocity y

var balls = []
var gravity = -0.35
var bounce = .8

document.getElementById('indexCanvas').addEventListener('click', function (event) {
    console.log("xxx")
    balls.push(new Ball(event.offsetX, event.offsetY, 10, randomColor()))
});







animate()
function randomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
function animate(){
    console.log("animate")
    
    
    requestAnimationFrame(animate);
    ctxt.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < balls.length; i++){
        if(balls[i].bounceCount == 4){
            balls.splice(i)
        }
    }

    
    
    for(let i = 0; i < balls.length; i++){
        
        drawCircle(balls[i], ctxt)
        if (
            balls[i].x + balls[i].radius > canvas.width ||
            balls[i].x - balls[i].radius < 0 ||
            balls[i].y + balls[i].radius > canvas.height// ||
            
            //ball.y - ball.radius  < 0
        ) {
            balls[i].bounceCount++

            // Re-positioning on the base
 

            // If we do not re-set the velocities
            // then the ball will stick to bottom

            // Velocity x
            vx = 0;
            // Velocity y
            balls[i].vy *= -bounce
            balls[i].y -= balls[i].radius
            gravity = -.35
        }
        else{ 

            balls[i].y -= balls[i].vy
            balls[i].vy += gravity
        }
    }
    
    
}
function Ball(x,y,radius, color){
    this.vy = 2
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.bounceCount = 0
    
}
function drawCircle(ball,ctxt) {
    
    ctxt.fillStyle = ball.color
    ctxt.beginPath();
    ctxt.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, true)
    ctxt.fill()
    
    ctxt.closePath()
    
}