var api = require('mikronode');
var Hapi = require("hapi");
var moment = require('moment');
var storage = require('node-persist');
var async = require('async');

var updateInteval = 1; //Interval time in minutes
var interfaceName = 'pppoe-out1';


storage.initSync();

var server = new Hapi.Server(8080, "localhost", {
	views: {
	    engines: {
	        jade: require("jade")
	    },
	    path: "./views",
	}
});


function collectData(callback){
	var connection = new api('10.1.1.254','grapher','grapher', {debug: 0});
	connection.connect(function(conn) {
		var chan = conn.openChannel();

		chan.write(['/interface/print', '=stats', '=.proplist=.id,rx-byte,tx-byte,uptime', '?=name='+interfaceName] ,function() {
			chan.on('done',function(data) {

				
				var parsed = api.parseItems(data);

				chan.close();
				conn.close();
				
				return callback(null, parsed);

			});
		});
	});
}

function updateData(callback){
	console.log('Performing update...');
	var yearMonth = moment().year()+'-'+moment().month();
	//Set year object if we don't have it already (and set month objects too)
	if(!storage.getItem( yearMonth )){
		storage.setItem( yearMonth, {});
	}

	var data = storage.getItem( yearMonth );
	var date = moment().date();

	//Check that we have the item for this day
	if(!data[ date ]){
		data[ date ] = [0, 0, -1, -1];
	}

	collectData(function(err, returnedData){
		//If the data we get for RX and TX is bigger than what we have stored, then thats the correct value
		//If its smaller, then we need to add the info we received to the data we had (this will happen when the router reboots and resets stats)
		if(returnedData[0]['rx-byte'] < data[ date ][2] || data[ date ][2] == -1){
			data[ date ][2] = returnedData[0]['rx-byte'];
		}else{
			data[ date ][0] = data[ date ][0] + ( returnedData[0]['rx-byte'] - data[ date ][2] );
		}

		if(returnedData[0]['tx-byte'] < data[ date ][3] || data[ date ][3] == -1){
			data[ date ][3] = returnedData[0]['tx-byte'];
		}else{
			data[ date ][1] = data[ date ][1] +  ( returnedData[0]['tx-byte'] - data[ date ][3] );
		}

		storage.setItem(yearMonth, data);	

		console.log('Update complete');
		if(typeof callback == 'function') return callback(null);

	});

}




server.start(function() {
    console.log("Hapi server started @", server.info.uri);
});

function returnChart(request, reply){
	var year = '';
	var month = '';
	if(request.params.year && request.params.month){
		month = moment().month( request.params.month );
		year = moment().year( request.params.year ).format('YYYY');
	}else{
		month = moment();
		year = moment().format('YYYY');
	}

	var data = storage.getItem( year+'-'+month.month() );
	var monthRx = [];
	var totalRx = 0.0;
	var monthTx = [];
	var totalTx = 0.0;
	var monthDays = month.daysInMonth();

	var availableCharts = {};

	//Calculate what data we have to show in menu
	for(var j = 0; j < storage.length(); j++){
		var key = storage.key(j).split('-');
		if(availableCharts[ key[0] ] == undefined){
			availableCharts[ key[0] ] = [];
		}
		
		availableCharts[ key[0] ].push( moment().month( parseInt(key[1]) ).format("MMMM") );

	}

	for(var i = 0; i < monthDays; i++){
		monthRx[i] = data[i+1]?(data[i+1][0]/1024/1024/1024):0.0;
		totalRx += monthRx[i];
		monthTx[i] = data[i+1]?(data[i+1][1]/1024/1024/1024):0.0;
		totalTx += monthTx[i];
	}

	reply.view("index", {
	    title: 'Index',
	    monthRx: monthRx,
	    monthTx: monthTx,
	    monthName: month.format("MMMM")+' '+year,
	    monthDays: monthDays,
	    totalRx: parseFloat(totalRx).toFixed(2),
	    totalTx: parseFloat(totalTx).toFixed(2),

	    availableCharts: availableCharts,
	});
}

server.route({
    path: "/",
    method: "GET",
    handler: returnChart
});

server.route({
    path: "/{year}/{month}",
    method: "GET",
    handler: returnChart
});

server.route({
    path: "/static/{path*}",
    method: "GET",
    handler: {
        directory: {
            path: "./public",
            listing: false,
            index: false
        }
    }
});



/*


data>yesterdays Max?


*/


updateData();
setInterval(function(){
	updateData();
}, updateInteval*60*1000);
