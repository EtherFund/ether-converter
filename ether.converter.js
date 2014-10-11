/*
- ether.converter.js v0.1
- Convert between different denominations of Ether, BTC, and USD$.
- for http://ether.fund/tool/converter
- by @jrbedard
*/

// Ethereum ether genesis sale, 1 BTC = 2000 ETH
var SALE_PRICE = 2000.0;

var btcprice = 0.0;



// Init
$(function () {
	//$('.input-group-addon').tooltip({container:'body'});
	var hash = document.location.hash
	if(hash) {
		var params = getHashParams();
		$("#input-value").val(params['v']);
		$("#btn-unit").val(params['u']);
		$("#btn-unit").html(params['u']+" <span class='caret'></span>");
		$("#in-"+params['u']).addClass("active");
	} else {
		$("#input-value").val(1);
		$("#btn-unit").val("ether");
		$("#btn-unit").html("ether <span class='caret'></span>");
		$("#in-ether").addClass("active");
	}
	
	// Get Bitcoin price
	$.get('/api/btc_price', function(data) {
		btcprice = data.toFixed(2);
		
		$(".btcprice").text(btcprice);
		$("#out-usd .input-group-addon").attr('title', "1 Bitcoin = "+btcprice+" $USD");
		
		var input = validate();
		if(input) {
			convert(input);
			$("#go-btn").removeClass('disabled');
		}
	});
});



// Selected unit
$("#dropdown-unit li a").click(function() {
 	var unit = $(this).text();
	var unitBtn = $(this).parents('.input-group').find('.dropdown-toggle');
	unitBtn.html(unit+" <span class='caret'></span>");
	unitBtn.val(unit);
	
	$("#dropdown-unit li").removeClass("active");
	$("#in-"+unit).addClass("active");
});



// Clicked GO
$("#go-btn").click(function() {
	var input = validate();
	if(input) {
		convert(input);
		document.location.hash = "v="+input.value+'&u='+input.unit; // change arguments
		$("#input-value-wrap").removeClass("has-error");
	}
});

// Pressed Enter
$('#input-value, #btn-unit, #go-btn').keypress(function (e) {
	var key = e.which;
	if(key == 13) {
		$('#go-btn').click();
		return false;
	}
});   




// Validate
function validate() {
	var val = $("#input-value").val();
	if(val=="") {
		val = $("#input-value").attr('placeholder');
	} else if(isNaN(val)) {
		$("#input-value-wrap").addClass("has-error");
		return null;
	}
	if(val.length > 14) {
		$("#input-value-wrap").addClass("has-error");
		return null;
	}
	
	var unit = $("#btn-unit").val();
	return {value:parseFloat(val), unit:unit};
}



// Convert
function convert(input) {
	if(!input) { return; }
	
	$(".in-value").html(input.value);
	$(".in-unit").html(input.unit);
	$(".input-group").removeClass("has-success");
	
	
	// if input is an ETH unit:
	if(input.unit in ETH_UNITS) {
		
		var output = convertEther(input, null);
		fillInputs(output);
		
		var btc = new BigNumber(output['ether']).dividedBy(SALE_PRICE);
		output = convertBTC({'value':btc, 'unit':"BTC"}, null);
		fillInputs(output);
		
		$("#out-usd input").val(btc.times(btcprice).noExponents());
		$("#out-"+input.unit).addClass("has-success");
	
	
	
	// else if input is a BTC unit:
	} else if(input.unit in BTC_UNITS) {
		
		var output = convertBTC(input, null);
		fillInputs(output);
		
		var btc = new BigNumber(output['BTC']);
		var ether = btc.times(SALE_PRICE);
		output = convertEther({'value':ether, 'unit':"ether"}, null);
		fillInputs(output);
		
		$("#out-usd input").val(btc.times(btcprice).noExponents());
		$("#out-"+input.unit).addClass("has-success");
	
	
	
	// else if input is USD$:
	} else if(input.unit == "USD") {
		
		var output = convertBTC({'value':new BigNumber(input['value']).dividedBy(btcprice), 'unit':"BTC"}, null);
		fillInputs(output);
		
		var btc = output['BTC'];
		var ether = new BigNumber(btc).times(SALE_PRICE);
		output = convertEther({'value':ether, 'unit':"ether"}, null);
		fillInputs(output);
		
		$("#out-usd input").val(input['value']);
		$("#out-usd").addClass("has-success");

		
	} else {
		
	}	
}


// fill input fields
function fillInputs(object) {
	$.each(object, function(unit, value) {
		$("#out-"+unit+" input").val(value);
	});	
}







