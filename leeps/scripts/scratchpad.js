

var body = document.body;
var $rangeslider = $('#js-amount-range');
var $amount = $('#js-amount-input');
var user = [];
var profitarry = [];
var rand = [];
var cumulative = 0;
var show = false;
var stochastic;





$rangeslider
  .rangeslider({
    polyfill: false
  })
  .on('input', function() {
    $amount[0].value = this.value;
  });

$amount.on('input', function() {
  $rangeslider.val(this.value).change();
});


function where(){	
	var number = 0;
	
	while(number != null){
		var number = prompt("Enter a number between 0 and 1");
		stochastic = Math.random();
		
		
		if(number != null){
			var profit = (1-((Number(number) - stochastic) * (Number(number) - stochastic)))
			user.push(number);
			rand.push(stochastic);
			profitarry.push(profit);
			cumulative += profit;
			document.getElementById("profit").innerHTML = "Profit: " + profit;
			document.getElementById("cumulative").innerHTML = " Cumulative Profit " + cumulative;
			if(show){

			document.getElementById("randnum").innerHTML = "Stochastic Value: " + stochastic;

			}
			else{
				document.getElementById("randnum").innerHTML = "";
			}


		}

	}

}
function toggle(){
	show = !show;
	if(show){

			document.getElementById("randnum").innerHTML = "Stochastic Value: " + stochastic;

	}

}





