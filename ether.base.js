/*
- ether.base.js v0.1
- Basic data structures and utilities to build ethereum tools & tutorials
- for http://ether.fund
- by @jrbedard
*/

var ETH_UNITS = {'wei':1e-18, 'Kwei':1e-15, 'Mwei':1e-12, 'Gwei':1e-9, 'szabo':1e-6, 'finney':1e-3, 
	'ether':1.0, 'Kether':1e3, 'Mether':1e6, 'Gether':1e9, 'Tether':1e12
};

var BTC_UNITS = {'satoshi':1e-8, 'bit':1e-6, 'BTC':1.0};



function convertEther(input, options) {
	// todo options
	var ether = new BigNumber(ETH_UNITS[input['unit']]).times(input['value']); // value for 1 ETH
	
	var output = $.extend({}, ETH_UNITS);
	$.each(ETH_UNITS, function(unit, value) {
		output[unit] = ether.dividedBy(value).noExponents(); // for unit
	});
	return output;
}


function convertBTC(input, options) {
	// todo options
	var btc = new BigNumber(BTC_UNITS[input['unit']]).times(input['value']); // value for 1 BTC
	
	var output = $.extend({}, BTC_UNITS);
	$.each(BTC_UNITS, function(unit, value) {
		output[unit] = btc.dividedBy(value).noExponents(); // for unit
	});
	return output;
}


// convert 1e3 -> 1000
BigNumber.prototype.noExponents = function(){
    var data= String(this).split(/[eE]/);
    if(data.length== 1) return data[0]; 

    var  z= '', sign= this<0? '-':'',
    str= data[0].replace('.', ''),
    mag= Number(data[1])+ 1;

    if(mag<0){
        z= sign + '0.';
        while(mag++) z += '0';
        return z + str.replace(/^\-/,'');
    }
    mag -= str.length;  
    while(mag--) z += '0';
    return str + z;
}

Number.prototype.withCommas = function() {
	return this.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


function getHashParams() {
    var hashParams = {};
    var e,
        a = /\+/g, // Regex for replacing addition symbol with a space
        r = /([^&;=]+)=?([^&;]*)/g,
        d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
        q = window.location.hash.substring(1);

    while (e = r.exec(q))
       hashParams[d(e[1])] = d(e[2]);

    return hashParams;
}