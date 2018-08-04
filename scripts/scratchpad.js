

var body = document.body;






function dank(){
	 i = prompt("enter a number 2 add 2");
  	 document.getElementById("jstest").innerHTML = "RESULT: " + (Number(i) + 2);
  	 document.body.style.backgroundColor = "black";

  	 
	 
}
function change(){
	document.body.style.backgroundColor = getRandomColor();
}
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

