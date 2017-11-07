
function init(){
    startTime();
    getLocation();
}

var hr;

function startTime() {	
    var today = new Date();
    var h = today.getHours();
    hr = h;
    var m = today.getMinutes();
    var s = today.getSeconds();
    var d = today.getDate();
    var day = today.getDay();
    var mo = today.getMonth() + 1;
    var y = today.getFullYear();
    h = checkTime(h);
    m = checkTime(m);
    s = checkTime(s);
    d = checkTime(d);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var week = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    day = week[day];
    mo = months[mo-1];
    document.getElementById('clock').innerHTML =
    "<h2>"+day +", "+ d + "-" + mo + "-" + y + ", " + h + ":" + m + ":" + s + "</h2> ";
    var t = setTimeout(startTime, 500);
    
    var offset = new Date().toString().match(/([A-Z]+[\+-][0-9]+.*)/)[1];
    document.getElementById('zone').innerHTML = "<small class=\"text-muted\">" + offset + "</small>";
    
    document.getElementById('footer').innerHTML = "&copy; Copyright Suvankar Mitra " + y;
}
function checkTime(i) {
    if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
    return i;
}

//geo location access
function getLocation() {
    //console.log("Inside getLocation");
    //'http://www.geoplugin.net/json.gp?jsoncallback=?'
    var ip = "https://freegeoip.net/json/?callback=?";
    $.getJSON(ip, function(data) {
      //console.log(JSON.stringify(data, null, 2));
      //showPosition(data.geoplugin_latitude, data.geoplugin_longitude, data.geoplugin_city); //for geoplugin.net
      showPosition(data.latitude,data.longitude,data.city); //for freegeoip.net
      document.getElementById('ip').innerHTML = data.ip;
      if(hr>=18 || hr <=6) {
        document.getElementById('weather-loc').innerHTML = "<small class=\"glyphicon glyphicon-map-marker\" style=\"color:#ef592b;\"></small> <small class=\"text-muted\" id=\"loc\">"+data.geoplugin_city+"</small> "+" <i class=\"fa fa-moon-o\" style=\"font-size:24px;color:#ef592b;\"></i>"; //&#xe232
        
      } else {
        document.getElementById('weather-loc').innerHTML = "<small class=\"glyphicon glyphicon-map-marker\" style=\"color:#ef592b;\"></small> <small class=\"text-muted\" id=\"loc\">"+data.geoplugin_city+"</small> "+" <i class=\"fa fa-sun-o\" style=\"font-size:24px;color:#ef592b;\"></i>"; //
      }
    });
}

function showPosition(lat, long, local) {
    //console.log("Inside showPosition");
    
    $.getJSON("http://nominatim.openstreetmap.org/search?q="+lat+","+long+"&format=json", function(result){
        $.each(result, function(i, field){
            //console.log(field);
            var loc = field.display_name;
            //console.log(loc);
            //console.log(lat+","+long);
            if(local=='') {
                document.getElementById('loc').innerHTML = loc;
                getWOEID(loc);
            }
            else {
                document.getElementById('loc').innerHTML = local;
                getWOEID(loc);
            }
        });
    },{enableHighAccuracy: false});
}

function getWOEID(search) {
    //console.log("Inside getWOEID");
    // Cache results for an hour to prevent overuse
	var now = new Date();
	
	// Create Yahoo Weather feed API address
	var query = 'select * from geo.places where text="'+ search +'"';
	var api = 'http://query.yahooapis.com/v1/public/yql?q='+ encodeURIComponent(query) +'&rnd='+ now.getFullYear() + now.getMonth() + now.getDay() + now.getHours() +'&format=json&callback=?';
	//console.log(api);

	// Send request
	$.ajax({
	    type: 'GET',
		url: api,
		dataType: 'json',
		success: function(data) {
		    //console.log(data);
		    //console.log(data.query.results.place.woeid);
		    var woeid = data.query.results.place.woeid;
		    var query = "https://query.yahooapis.com/v1/public/yql?q=select%20item.condition%20from%20weather.forecast%20where%20woeid%20%3D"+woeid+"&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";
		    $.ajax({
		        type: 'GET',
		        url: query,
		        dataType: 'json',
		        success: function(data) {
		            //console.log("weather data");
		            var temp = data.query.results.channel.item.condition.temp;
                    var text = data.query.results.channel.item.condition.text;
                    
                    var we = "";
                    //console.log(text.toUpperCase().includes("CLOUD"));
                    if(text.toUpperCase().includes("CLOUD")) {
                        we = " <i class=\"wi wi-cloudy\" style=\"font-size:24px;color:#ef592b;\"></i> ";
                    } else if (text.toUpperCase().includes("PART") && text.toUpperCase().includes("CLOUD")) {
                        we = " <i class=\"wi wi-partly-cloudy\" style=\"font-size:24px;color:#ef592b;\"></i> ";
                    } else if (text.toUpperCase().includes("SHOWER")) {
                        we = " <i class=\"wi wi-showers\" style=\"font-size:24px;color:#ef592b;\"></i> ";
                    }
                    document.getElementById('weather').innerHTML = we+text+", "+fahrToCelc(temp)+"&#8451;";
                    
		        },
		        error: function(data){console.log("error getting weather");}
		    });
		},
		error: function(data) {console.log("Error at YML");}
	});
}

function fahrToCelc(fahrenheit) {
    return Math.round((fahrenheit - 32) * 5 / 9); 
} 
