

var body = document.body;
var $rangeslider = $('#js-amount-range');
var $amount = $('#js-amount-input');
var user = [];
var profitarry = [];
var rand = [];
var time = [];
var timen = 0;
var cumulative = 0;
var show = false;
var stochastic;
var number;




var ctx = document.getElementById('chart');
var chart = new Chart(ctx, {
	type: 'line',
	data: {
		labels: [],
		datasets: [{
			label: 'Time Series of User Values',
			borderColor: 'rgb(255, 99, 132)',
			data: user
		}],
	},
	options: {
		responsive: false, // responds to your browser window size
	}
});

var ctx1 = document.getElementById('chart1');
var chart1 = new Chart(ctx1, {
	type: 'line',
	data: {
		labels: [],
		datasets: [{
			label: 'Time Series of Stochastic Values',
			borderColor: 'rgb(255, 99, 132)',
			data: rand
		}],
	},
	options: {
		responsive: false, // responds to your browser window size
		layout: {
			display: 'inline-block'
		}
	}
});




function add(){
	var value = document.getElementById('input').value;
	where(value);
}


function where(number1){	
		console.log("where	", number1);
	
	
	
		//var number = prompt("Enter a number between 0 and 1");
		stochastic = Math.random();
		
		
		if(number1 != null){
			var profit = (1-((Number(number1) - stochastic) * (Number(number1) - stochastic)))
			user.push(number1);
			chart.data.datasets[0].data = user;
			chart.data.labels.push(user.length);
			chart.update();
			chart1.data.datasets[0].data = rand;
			chart1.data.labels.push(rand.length);
			chart1.update();
			rand.push(stochastic);
			profitarry.push(profit);
			time.push(timen);
			timen++;
			cumulative += profit;
			document.getElementById("profit").innerHTML = "Current Profit: " + profit.toFixed(3);
			document.getElementById("cumulative").innerHTML = " Cumulative Profit " + cumulative.toFixed(3);
			if(show){

			document.getElementById("randnum").innerHTML = "Stochastic Value: " + stochastic;

			}
			else{
				document.getElementById("randnum").innerHTML = "";
				
			}


		}

	

}
function toggle(){
	show = !show;
	if(show){
		document.getElementById("randnum").innerHTML = "Stochastic Value: " + stochastic;
	}
	else{
		document.getElementById("randnum").innerHTML = "";

	}

}





