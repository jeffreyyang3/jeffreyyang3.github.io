

var body = document.body;
var $rangeslider = $('#js-amount-range');
var $amount = $('#js-amount-input');

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
	
	while(true){
		var number = prompt("Enter a number between 0 and 1");
		var stochastic = Math.random();
		var profit = (1-((Number(number) - stochastic) * (Number(number) - stochastic)))
		document.getElementById("profit").innerHTML = "Profit: " + profit;

	}

}


