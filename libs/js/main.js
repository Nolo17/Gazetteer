//var mymap = L.map('mapid').setView([51.505, -0.09], 13);
let countryDropdown = $('#countryDropdown');

//variables for general Info
let countryInfo=[];
let countryIso2 ='';
let countryName='';
let lang = '';
let flag = '';

//variables for economic Info
let incomeLevel= '';
let economicData=[];
let currencyExchange='';

//variables for Covid Info
let CovidData =[];

//variables for biggest cities
let cities=[];

//weatherVariable
let weatherInfo=[];

//emission Variable
let emissions=[];


var streetMapUrl ='https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
    streetMapAttrib = 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
    satMapUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    satMapAttrib = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'

var streetMap = L.tileLayer(streetMapUrl, {attribution: streetMapAttrib}),
    satMap = L.tileLayer(satMapUrl, {attribution: satMapAttrib});

var mymap = L.map('mapid', {
     layers: [streetMap] ,// only add one!
     maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'your.mapbox.access.token'
    })
    .setView([51.505, -0.09], 13);

var baseLayers = {
 "Streets": streetMap,
 "Satellite": satMap
};


var cloudMap = L.tileLayer('http://{s}.tile.openweathermap.org/map/clouds/{z}/{x}/{y}.png?appid={apiKey}', {
	maxZoom: 19,
	attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
	apiKey: 'f23619a89b07343b833f164f8d7202a1',
	opacity: 0.5
});
var pressureMap = L.tileLayer('http://{s}.tile.openweathermap.org/map/pressure/{z}/{x}/{y}.png?appid={apiKey}', {
	maxZoom: 19,
	attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
	apiKey: 'f23619a89b07343b833f164f8d7202a1',
	opacity: 0.5
});
var windMap = L.tileLayer('http://{s}.tile.openweathermap.org/map/wind/{z}/{x}/{y}.png?appid={apiKey}', {
	maxZoom: 19,
	attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
	apiKey: 'f23619a89b07343b833f164f8d7202a1',
	opacity: 0.5
});

var overlayMaps = {
  "clouds": cloudMap,
  'pressure': pressureMap,
  'wind': windMap
};

L.control.layers(baseLayers, overlayMaps).addTo(mymap);

function main(){

$('#loadingEl').show();

getCountrySelect();

getLocation();

// Injecting info button into HTML

L.easyButton( '<i class="fas fa-info-circle"></i>', function(){
  displayCountryInfo();
}
).addTo(mymap); 

L.easyButton( 'fa-usd', function(){
  displayEconomicInfo()
}).addTo(mymap); 

L.easyButton( 'fa-city', function(){
  displayCityMarkers(); 
}).addTo(mymap);

L.easyButton( '<i class="fas fa-cloud-sun"></i>', function(){
  displayWeatherInformation();
}).addTo(mymap);

L.easyButton( '<i class="fas fa-virus"></i>', function(){
  displayCovidData();
}).addTo(mymap); 

L.easyButton('<i class="fas fa-smog"></i>', function(){
  displayEmissionInfo();
}).addTo(mymap);

L.easyButton('<i class="fas fa-charging-station"></i>', function(){
  getChargingPoints();
}).addTo(mymap);

countryDropdown.change(function() {
  getData(countryDropdown.val()); 
});

$('#loadingEl').hide();
};

//  get country select menu
function getCountrySelect()  {
  $.ajax({
    url: "libs/php/getCountryBorders.php",
    type: 'POST',
    dataType: 'json',
    success: function(result) {
      if (result.status.name == "ok") {
        countryDropdown.html('');
        $.each(result.data, function(index) {
            countryDropdown.append($("<option>", {
                value: result.data[index].code,
        
                text: result.data[index].name
            }));  
        
        }); 
      }
    
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR + textStatus +  errorThrown)
    }
  }); 
}


// get initial location
 function getLocation() {
   if (navigator.geolocation) {
     navigator.geolocation.getCurrentPosition(showPosition);  
 } else {
   alert ("Geolocation not possible."); 
 } 
}

 function showPosition(position) {
    $.ajax({
    url: "libs/php/getCountryCode.php",
    type: 'POST',
    dataType: 'json',
    data: {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    },
    success: function(result) {
    
      
      if (result.status.name == "ok") {
        let countryCode = result['countryCodeData'];
        console.log(countryCode);
        $('#countryDropdown').val(countryCode);
        var positionMarkerOps = L.ExtraMarkers.icon({
          icon: 'fa-location-arrow',
          markerColor: 'yellow',
          shape: 'circle',
          prefix: 'fa'
        });
        
        let positionMarker = L.marker([position.coords.latitude, position.coords.longitude], {icon: positionMarkerOps}).addTo(mymap);
            positionMarker.bindPopup('You are here').addTo(mymap); 
            
            getData(countryCode);
      } 
    
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR + textStatus +  errorThrown)
    } 
  });  
};

// get Country borders from geoJson file
 function getCountryBorders(country)  {
  $.ajax({
    url: "libs/php/getCountryBorders.php",
    type: 'POST',
    dataType: 'json',
    data: {
      countryName: country
    },
    success: function(result) {
      if (result.status.name == "ok") {
      let borders= result.borders;
    var geoJsonLayer= L.geoJson(borders, {color:'#c1cd32'}).addTo(mymap);
    mymap.fitBounds(geoJsonLayer.getBounds());
    
    (countryDropdown.change(function(){
      if (geoJsonLayer){
        geoJsonLayer.remove(mymap)
      };
      geoJsonLayer= L.geoJson(borders, {stroke: false, color:'#151305', opacity:0.01}).addTo(mymap);
    })
    ); 
      } 
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR + textStatus +  errorThrown)
    }
  }); 
}


function getData(countryCode){
  const d = new Date();
  const startdate = (d.getFullYear()-1)+'-'+(d.getMonth()+1)+'-'+d.getDate(); 
  const enddate=  d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
  $.ajax({
    url: "libs/php/getCountry.php",
    type: 'POST',
    dataType: 'json',
    data: {
        country: countryCode,
        startDate: startdate,
        endDate: enddate
      },
    success: function(result) {

      if (result.status.name == "ok") {
        console.log(result);
        countryInfo=result['countryInfoData'];
        countryName= result['countryInfoData'][3]; 
        lang = result['restCountriesData'][1];
        flag = result['restCountriesData'][2];
        incomeLevel= result['worldBankData'];
        economicData=result['restCountriesData'][0][0];
        currencyExchange=result['currencyData']|| 'N/A';
        cities = result ['cityData'];
        weatherInfo= result['weatherData'];
        covidData=result['covidData']
        emissions=result['emissionData'];
        let country= countryName;
        getCountryBorders(country);       
      }
    
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR + textStatus +  errorThrown)
    }
  });
}

function displayCountryInfo(){
  function formatNumber(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  }
        let capital = countryInfo[1];
        let population= formatNumber(countryInfo[2]);
        let size = formatNumber(countryInfo[0]);
        let languages=''; 
        for (let i=0; i <lang.length; i++){
          languages+= lang[i]['name']+'/ '+lang[i]['nativeName']+'<br>'
        }
        let wikiLinkName = countryName.replace(' ','_');
        wikiLink = "https://en.wikipedia.org/wiki/"+wikiLinkName;
        let countryInfoContent = `<table class="table table-hover">
        <tr><td>Capital </td><td> ${capital}</td></tr> 
        <tr><td>Languages</td><td> ${languages}</td></tr>
         <tr><td>Population </td><td>${population}</td></tr>
         <tr><td>Size in km<sup>2</sup></td><td> ${size}</td></tr>
         </table>
         <a href=${wikiLink} target="_blank">Read more on Wikipedia</a>`;
        $('#modalTitle').html(countryName);
        $('#modalTitle').append('<img id="countryFlag" alt="Flag of Country" src='+flag+'>');
        $('#modal-body').empty();
        $("#modal-body").append(countryInfoContent); 
        $('#myModal').modal('toggle');
}

 function displayEconomicInfo(){
  let currencyName= economicData['name'];
  let currencyRate= (Math.round(currencyExchange*100))/100;
  let currencySymbol= economicData['symbol'];
  let economicInfoContent = `<table class="table table-hover"><tr><td>Income Level</td><td>${incomeLevel}</td></tr> 
  <tr><td>Currency Name </td><td>${currencyName}</td></tr> 
  <tr><td>Exchange Rate </td><td>1USD = ${currencyRate}${currencySymbol}</td></tr>
  </table>`;
  
  $('#modalTitle').html('Economic Information for '+ countryName);
  $('#modalTitle').append('<img id="countryFlag" alt="Flag of Country" src='+flag+'>');
  $('#modal-body').empty();
  $("#modal-body").append(economicInfoContent); 
  $('#myModal').modal('toggle');       
 }

 function displayCityMarkers(){
  function formatNumber(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  }
  // Creating city icon
  var cityMarkerOps = L.ExtraMarkers.icon({
    icon: 'fa-circle-o',
    markerColor: 'orange',
    shape: 'circle',
    prefix: 'fa'
  });
let cityMarkers=[];
for (var i = 0; i < cities.length; i++) {
  let population = formatNumber(cities[i]['population']);
   let weatherIcon= weatherInfo[i][1][0]['icon'] ;
    let weatherIconLink='http://openweathermap.org/img/wn/'+weatherIcon+'@2x.png';
    let temp= (weatherInfo[i][0]['temp']).toFixed(1);
    let popup = L.popup()
    .setContent(`<h6 class='text-center'>${cities[i]['name']}</h6> 
    <p class='tempPopup'>Population:</br> ${population}</p>
    <img class='mx-auto d-block m-0' src=${weatherIconLink} alt='weatherIcon' class='weatherPopup'> 
    <p class='tempPopup'>${temp}&deg;C</p>`);

    let cityMarker = L.marker([cities[i]['lat'], cities[i]['lng']], {icon: cityMarkerOps});
   //var positionMarker = new L.Marker([position.coords.latitude, position.coords.longitude], currentLocIcon);
      cityMarker.bindPopup(popup);
      cityMarkers.push(cityMarker);
    };
    let cityLayerGroup = L.layerGroup(cityMarkers);
    mymap.addLayer(cityLayerGroup)
    countryDropdown.change(function(){
    mymap.removeLayer(cityLayerGroup);
}); 
 }

 function displayWeatherInformation(){
   let cityTableContent = `<table class='table table-hover' id='weatherTable'>
   <thead><tr>
   <td>city</td>
   <td colspan="2">conditions</td>
   <td>temp</td>
   <td>feels like</td>
   </tr></thead>`;

   for (let i= 0; i< cities.length; i++){
    if (weatherInfo[i]== null){continue;}
    let weatherIcon=weatherInfo[i][1][0]['icon'] ;
    let weatherIconLink='http://openweathermap.org/img/wn/'+weatherIcon+'@2x.png';
    let description = weatherInfo[i][1][0]['description']
    let temp= (weatherInfo[i][0]['temp']).toFixed(1);
    let feelsLike= (weatherInfo[i][0]['feels_like']).toFixed(1);
    cityTableContent += 
    `<tr><td>${cities[i]['name']}</td>
    <td><img class='weatherIcon' src=${weatherIconLink} alt='weather Icon'></td>
    <td>${description}</td>
    <td>${temp}&deg;C</td>
    <td>${feelsLike}&deg;C</td></tr>`;
   }
   cityTableContent +="</table>"
   
  $('#modalTitle').html('Weather in '+ countryName);
  $('#modalTitle').append('<img id="countryFlag" alt="Flag of Country" src='+flag+'>');
  $('#modal-body').empty();
  $("#modal-body").append(cityTableContent); 
  $('#myModal').modal('toggle');  
 }

 function displayCovidData(){
  function formatNumber(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  }
  function formatDate(date){
    let changedDate = date.substr(8, 2) + date.substr(4, 4) + date.substr(0, 4) + ' ' + date.substr(11, 5);
    return changedDate;
  }
    let confirmed = formatNumber(covidData[0]);
    let critical = formatNumber(covidData[1]);
    let deaths = formatNumber(covidData[2]);
    let recovered= formatNumber(covidData[3]);
    let update = formatDate(covidData[4]); 
    let covidInfoContent = `<table class='table table-hover'>
        <tr><td>Confirmed Cases</td><td>${confirmed}</td></tr> 
        <tr><td>Critical Cases</td><td>${critical}</td></tr> 
        <tr><td>Deaths</td><td>${deaths}</td></tr> 
        <tr><td>Recovered</td><td>${recovered}</td></tr> 
        <tr><td>Last Update</td><td>${update}</td></tr> 
        </table>`;
    
        $('#modalTitle').html('Covid-19 Data for '+ countryName)
        $('#modal-body').empty();
        $("#modal-body").append(covidInfoContent); 
        $('#myModal').modal('toggle');    
 }

 function displayEmissionInfo(){
   let methane= (Math.round(emissions[0]*100))/100;
   let carbonmonoxide= (Math.round(emissions[1]*1000))/1000;
   let ozone= (Math.round(emissions[2]*1000))/1000;;
   let nitrogendioxide= (Math.round(emissions[3]*100000))/100000;
      let emissionInfoContent = `<table class="table table-hover">
        <tr><td>Methane </td><td>${methane}mol/m<sup>2</sup></td></tr> 
        <tr><td>Carbon Monoxide </td><td>${carbonmonoxide}mol/m<sup>2</sup></td></tr> 
        <tr><td>Ozone </td><td>${ozone}mol/m<sup>2</sup></td></tr> 
        <tr><td>Nitrogen Dioxide </td><td>${nitrogendioxide}mol/m<sup>2</sup></td></tr>
        </table>`;
        $('#modalTitle').html('Emissions (daily average in the last year) in '+ countryName)
        $('#modal-body').empty();
        $("#modal-body").append(emissionInfoContent); 
        $('#myModal').modal('toggle');

 }

 // get Charging Points for electric cars
function getChargingPoints()  {
  $.ajax({
    url: "libs/php/getChargingStations.php",
    type: 'POST',
    dataType: 'json',
    data: {
      countryCode: $('#countryDropdown').val(),
      },
    success: function(result) {

      let elecStationsArr = result['electricData'];

      if (elecStationsArr.length == 0) {
        alert('No charging stations in this country recorded yet.');
      } else {
      // Creating electric icon
      var elecMarkerOps = L.ExtraMarkers.icon({
        icon: 'fa-bolt',
        markerColor: 'green',
        shape: 'circle',
        prefix: 'fa'
      });
      
      
      var markers = new L.MarkerClusterGroup();
      console.log(result);
      console.log(elecStationsArr[1]['AddressInfo'])

      for (var i = 0; i < elecStationsArr.length; i++) {
          let elecStation = elecStationsArr[i]['AddressInfo'];
          let title = elecStation['Title'];
           let marker = L.marker([elecStation['Latitude'], elecStation['Longitude']], {icon: elecMarkerOps})
            marker.bindPopup(title);
            markers.addLayer(marker);
      };
      mymap.addLayer(markers);

      countryDropdown.change(function(){
        if (markers){
          mymap.removeLayer(markers);
        }
      }); 
    } 
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR + textStatus +  errorThrown)
    }

  });  
};

$(document).ready(() => {
  main();
});


