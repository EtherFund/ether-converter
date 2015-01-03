/*
- ether.converter.js v0.1
- Convert between different denominations of Ether, BTC, and USD$ on Ethereum.
- http://ether.fund/tool/converter
- (c) 2014 J.R. Bédard (jrbedard.com)
*/

var gDisplay='numeric'; //'commas','exponents'


// Init
$(function () {
	var params = getHashParams();
	if(params) {
		setEtherInput('value', params['v'], params['u']); // from URL hash
	} else {
		setEtherInput('value', 1, 'ether'); // default input
	}
	
	$("#input-value").selectRange(-1); // focus
	
	// Get Bitcoin price
	getBTCprice( function(btcprice) {
		$(".btcprice").text(btcprice);
		$("#out-usd .input-group-addon").attr('title', "1 Bitcoin = "+btcprice+" $USD");
		
		var input = validate();
		if(input) {
			convert(input);
			$("#go-btn").removeClass('disabled');
		}
	});
});



// Changed value
$("#input-value").bind("change paste keyup", function() {
   $('#go-btn').click(); return true;
});

// Selected unit
$("#dropdown-value li a").click(function() {
	setEtherInput('value', null, $(this).text()); // todo: use val, not text...
	
	$("#input-value").selectRange(-1); // focus
	$('#go-btn').click(); return false;
});

// Pressed Enter
$('#input-value, #btn-value, #go-btn').keypress(function (e) {
	var key = e.which;
	if(key == 13) {
		$('#go-btn').click(); return false;
	}
});

// Clicked GO
$("#go-btn").click(function() {
	var input = validate();
	if(input) {
		convert(input);
	}
});

// Display numeric options
$("#displayNumber button").click(function() {
	gDisplay = $(this).data('name');
	$("#displayNumber button").removeClass('active');
	$(this).addClass('active');
	$('#go-btn').click(); return false;
});




// Validate
function validate() {
	var input = validateEtherInput(['value']);
	if(!input) {
		return input;
	}
	
	input['value']['hash'] = ['v','u'];
	//console.log(input);
	setHashParams(input, false);
	return input;
}



// Convert
function convert(input) {
	if(!input) { return; }
	//console.log(input);
	var input = input['value'];
	
	$(".in-value").html(" "+input.value);
	$(".in-unit").html(" "+input.unit+" =");
	$(".input-group").removeClass("has-success");
	
	$('#etherHelp').attr('title', input.value+" "+input.unit+" to ether denominations");
	$('#btcHelp').attr('title', input.value + " " + input.unit+" to Bitcoin/USD$");
	$('.etherHelp').tooltip('destroy');
	$('.etherHelp').tooltip({placement:'top'});
	
	
	// if input is an ETH unit:
	if(input.unit in ETH_UNITS) {
		
		$("#out-"+input.unit).addClass("has-success");
		var output = convertEther(input, null);
		fillResults(output);
		
		var btc = new BigNumber(output['ether']).dividedBy(SALE_PRICE);
		output = convertBTC({'value':btc, 'unit':"BTC"}, null);
		output['usd'] = btc.times(gBtcPrice);
		
		fillResults(output);
		
	
	// else if input is a BTC unit:
	} else if(input.unit in BTC_UNITS) {
		
		$("#out-"+input.unit).addClass("has-success");
		var output = convertBTC(input, null);
		fillResults(output);
		
		var btc = new BigNumber(output['BTC']);
		var ether = btc.times(SALE_PRICE);
		output = convertEther({'value':ether, 'unit':"ether"}, null);
		output['usd'] = btc.times(gBtcPrice);
		
		fillResults(output);
	
	
	// else if input is USD$:
	} else if(input.unit == "USD") {
		
		$("#out-usd").addClass("has-success");
		var output = convertBTC({'value':new BigNumber(input['value']).dividedBy(gBtcPrice), 'unit':"BTC"}, null);
		fillResults(output);
		
		var btc = output['BTC'];
		var ether = new BigNumber(btc).times(SALE_PRICE);
		output = convertEther({'value':ether, 'unit':"ether"}, null);
		output['usd'] = input['value'];
		
		fillResults(output);
		
	} else {
		
	}
}


// fill results fields
function fillResults(object) {
	$.each(object, function(unit, value) {
		if(gDisplay == 'commas') {
			value = BigNumber(value).withCommas();
		} else if(gDisplay == 'exponents') {
			value = BigNumber(value).asExponent();
		}
		$("#out-"+unit+" input").val(value);
	});	
}







