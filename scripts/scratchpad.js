var h1 = document.querySelector("h1");
var body = document.body;
arry = ["asdf", 42, true];
/*for(i = 0; i < arry.length; i++){
  console.log(arry[i]);
  
}*/

//alert("...Ready for It?");







function dank(){
	 i = prompt("enter a number 2 add 2");
  	 document.getElementById("jstest").innerHTML = "RESULT: " + (Number(i) + 2);
  	 document.body.style.backgroundColor = "purple";

  	 
	 
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

