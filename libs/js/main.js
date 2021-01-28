//var mymap = L.map('mapid').setView([51.505, -0.09], 13);
const geoJsonData = "libs/geoJson/countryBorders.geo.json"
let countryDropdown = $('#countryDropdown');

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



$('#loadingImg').show();
countryDropdown.empty();

countryDropdown.append('<option selected="true" disabled>Select Country</option>');
countryDropdown.prop('selectedIndex', 0);

$.getJSON(geoJsonData, function (countries) {
   $.each(countries.features, function (key, entry) {
      countryDropdown.append($('<option></option>').attr('value', entry.properties.ISO_A2).text(entry.properties.ADMIN));
  }) 

}); 

//if (!('hasCodeRunBefore' in localStorage)){
  getLocation();
//  localStorage.setItem("hasCodeRunBefore", true);
//};

// Injecting info button into HTML

L.easyButton( '<i class="fas fa-info-circle"></i>', function(){
  getCountryInformation();
}).addTo(mymap);

L.easyButton( 'fa-usd', function(){
  getEconomicInformation();  
}).addTo(mymap);

L.easyButton( 'fa-city', function(){
  getCities();
  //getWeather();
  console.log(getCities());
}).addTo(mymap);

L.easyButton( '<i class="fas fa-cloud-sun"></i>', function(){
  getWeatherrr();
  //displayNames();
}).addTo(mymap);

L.easyButton( '<i class="fas fa-virus"></i>', function(){
  getCovidInformation();
}).addTo(mymap);

L.easyButton('<i class="fas fa-smog"></i>', function(){
  getEmissions();
}).addTo(mymap);

L.easyButton('<i class="fas fa-charging-station"></i>', function(){
  getChargingPoints();
}).addTo(mymap);



$('#countrySelectButton').click(function(e){
  e.preventDefault();
  getCountryBorders();

});
countryDropdown.change(function () {
  getCountryBorders();
});
$('#loadingImg').hide();

};


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
    url: "libs/php/getCountry.php",
    type: 'POST',
    dataType: 'json',
    data: {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    },
    success: function(result) {
      

      // Creating current Location icon
    
      var currentLocOption = L.icon({
        iconUrl: "./libs/img/currentLoc.png",
        iconSize: [22, 31],
        iconAnchor: [9, 21],
        popupAnchor: [0, -14]
      });

      const currentLocIcon ={icon: currentLocOption};

      const countryCode = result['countryCodeData']['countryCode'];
      console.log(result['countryCodeData']);
      
      if (result.status.name == "ok") {
        $('#countryDropdown').val(countryCode);
         var positionMarker = new L.Marker([position.coords.latitude, position.coords.longitude], currentLocIcon);
            positionMarker.bindPopup('You are here').addTo(mymap); 
            
        return getCountryBorders();
      } 
    
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR + textStatus +  errorThrown)
    } 
  }); 
  
};

function getCountryBorders() {
  $.getJSON(geoJsonData, function(countries){
    // L.geoJson function is used to parse geojson file and load on to map
    let currentCountry =  $('#countryDropdown option:selected').text();
    var geoJsonLayer= L.geoJson(countries, {filter: getCurrentCountry, color:'#c1cd32'}).addTo(mymap);
      function getCurrentCountry(feature) {
      //let currentCountry =  $('#countryDropdown option:selected').text();
      console.log(currentCountry);
      if (feature.properties.ADMIN === currentCountry) return true
    }
    mymap.fitBounds(geoJsonLayer.getBounds());
    
    (countryDropdown.change(function(){
      if (geoJsonLayer){
        geoJsonLayer.remove(mymap)
      };
      geoJsonLayer= L.geoJson(countries, {filter: getCurrentCountry, stroke: false, color:'#151305', opacity:0.01}).addTo(mymap);

    })
    ); 
} )};

// get general info on country 
function getCountryInformation()  {
  $.ajax({
    url: "libs/php/getCountry.php",
    type: 'POST',
    dataType: 'json',
    data: {
        country: $('#countryDropdown').val()
      },
    success: function(result) {

      console.log(result);

      if (result.status.name == "ok") {

        let countryName =result['countryInfoData'][0]['countryName'];
        wikiLink = "https://en.wikipedia.org/wiki/"+countryName;
        console.log(wikiLink);
        $('#modalTitle').html(countryName);
        $('#info1').html("Capital: "+ result['countryInfoData'][0]['capital']);
        $('#info3').html("Population: "+ result['countryInfoData'][0]['population']);
        $('#info4').html("Area in km<sup>2</sup>: "+ result['countryInfoData'][0]['areaInSqKm']);
        var wikiHTML = $('<a target="_blank" href='+wikiLink +'></a>').text("Read more on Wikipedia");
        $("#modal-body").append(wikiHTML);
        $('#myModal').modal('toggle');

      }
    
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR + textStatus +  errorThrown)
    }
  }); 
  $.ajax({
    url: "libs/php/getCountry.php",
    type: 'POST',
    dataType: 'json',
    data: {
        country: $('#countryDropdown').val()
      },
    success: function(result) {

      console.log(result);

      if (result.status.name == "ok") {
        const languageArr = result['restCountriesData']['languages']
        const countryFlag= result['restCountriesData']['flag']
        let languages='';
        for (let i=0; i <languageArr.length; i++){
          languages+= languageArr[i]['name']+'/ '+languageArr[i]['nativeName']+'<br>'
        }

        $('#modalTitle').append('<img id="countryFlag" alt="Flag of Country" src='+countryFlag+'>')
        $('#info2').html("Language: "+ languages);
      }
    
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR + textStatus +  errorThrown)
    }
  }); 
};

function getCities(){
  $.ajax({
    url: "libs/php/getCountry.php",
    type: 'POST',
    dataType: 'json',
    data: {
        countryCode: $('#countryDropdown').val()
      },
    success: function(result) {

      if (result.status.name == "ok") {

        console.log(result['cityData']);
    
       let locations = [
          [result['cityData']['geonames'][0]['name'], result['cityData']['geonames'][0]['lat'], result['cityData']['geonames'][0]['lng']],
          [result['cityData']['geonames'][1]['name'], result['cityData']['geonames'][1]['lat'], result['cityData']['geonames'][1]['lng']],
          [result['cityData']['geonames'][2]['name'], result['cityData']['geonames'][2]['lat'], result['cityData']['geonames'][2]['lng']],
          [result['cityData']['geonames'][3]['name'], result['cityData']['geonames'][3]['lat'], result['cityData']['geonames'][3]['lng']],
          [result['cityData']['geonames'][4]['name'], result['cityData']['geonames'][4]['lat'], result['cityData']['geonames'][4]['lng']],
          [result['cityData']['geonames'][5]['name'], result['cityData']['geonames'][5]['lat'], result['cityData']['geonames'][5]['lng']],
          [result['cityData']['geonames'][6]['name'], result['cityData']['geonames'][6]['lat'], result['cityData']['geonames'][6]['lng']],
          [result['cityData']['geonames'][7]['name'], result['cityData']['geonames'][7]['lat'], result['cityData']['geonames'][7]['lng']],  
        ];

        // Icon options
        var locationOptions = {
               iconUrl: "./libs/img/citylocation.png",
               iconSize: [22, 31]
                  }

        // Creating city icon
           var citylocIcon = L.icon(locationOptions);
           var citylocOptions ={icon: citylocIcon};

        for (var i = 0; i < 8; i++) {
          marker = new L.Marker([locations[i][1], locations[i][2]], citylocOptions)
            .bindPopup(locations[i][0])
            .addTo(mymap);
        };
        console.log(locations);

        for (let i=0; i< 8; i++){
          $.ajax({
          url: "libs/php/getCountry.php",
          type: 'POST',
          dataType: 'json',
          data: {
              city: locations[0][0]
            },
          success: function(result) {
      
            if (result.status.name == "ok") {
              console.log(result['weatherData']);
              let markup = "<table><tr><th>"+result['name']+"</th><th>"+result['main']['temp']+"</th><tr></table";
              
              $('#modal-body').html(markup);
              $('#myModal').modal('toggle');
    
      
            }
          
          },
          error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR + textStatus +  errorThrown)
          }
        });
      };
      }
    
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR + textStatus +  errorThrown)
    }
  });   
};

async function getCityNames() {
  let result;
  try {
      result = await $.ajax({
          url: "libs/php/getCountry.php",
          type: 'POST',
          data: {
            countryCode: $('#countryDropdown').val()
          }
      });
      return result['cityData']['geonames'];
  } catch (error) {
      console.error(error);
  }
};

async function displayNames(){
  let cityNames = await getCityNames();
  console.log(cityNames);
  let weatherDataArr=[];
  const weatherLoop = async _ => {
    console.log('Start')
    for (let i=0; i < cityNames.length; i++){
      $.ajax({
      url: "libs/php/getCountry.php",
      type: 'POST',
      dataType: 'json',
      data: {
          city: cityNames[i]['name'],
          countryCode:  $('#countryDropdown').val()
        },
      success: function(result) {
  
        if (result.status.name == "ok") {
          //console.log(result['weatherData']);
          let weatherinfo= [result['weatherData']['name'], [result['weatherData']['main']['temp']]];
          weatherDataArr.push(weatherinfo);
          //console.log(weatherDataArr);
        }
      
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR + textStatus +  errorThrown)
      }  
    });  
  }
  
    console.log('End')
    return weatherDataArr;
  }
  const weatherInfo = await weatherLoop();
console.log(weatherInfo);
return weatherInfo;
};

async function getWeatherrr(){
  let weatherInfo = await displayNames();
  console.log(weatherInfo);
  console.log(weatherInfo[0]);
  let countryName =$('#countryDropdown option:selected').text();
        $('#modalTitle').html('Weather Information for: '+countryName);
        //$('#info1').html(weatherInfo[7][0]+weatherInfo[7][1]);
        $('#myModal').modal('toggle');
  /*for (let i=0; i< 8; i++){
        //$('#modal-body').append('<table>');
        $('#modal-body').html(weatherDataArr[0][0]+weatherDataArr[1]);
        let markup = "<table><tr><th>"+weatherInfo[0][0]+"</th><th>"+result['main']['temp']+"</th><tr></table";
        //$('#modal-body').append('</table>');
        $('#myModal').modal('toggle');

  

} */
};


/*function getWeather(){
  $.ajax({
    url: "libs/php/getCountry.php",
    type: 'POST',
    dataType: 'json',
    data: {
        countryCode: $('#countryDropdown').val()
      },
    success: function(result) {

      if (result.status.name == "ok") {

        console.log(result);
        let citylocations = [];

        for(let i=0; i<8; i++){
          citylocations.push(result['cityData']['geonames'][i]['name']);
        }
        console.log(citylocations);

        let weatherDataArr=[];
        let weatherTable ='';
    
        for (let i=0; i< 8; i++){
          $.ajax({
          url: "libs/php/getCountry.php",
          type: 'POST',
          dataType: 'json',
          data: {
              city: citylocations[i],
              countryCode:  $('#countryDropdown').val()
            },
          success: function(result) {
      
            if (result.status.name == "ok") {
              console.log(result['weatherData']);
              let weatherinfo= [result['weatherData']['name'], [result['weatherData']['main']['temp']]];
              weatherDataArr.push(weatherinfo);
              weatherTable +=  "<tr><th>"+result['weatherData']['name']+"</th><th>"+result['weatherData']['main']['temp']+"</th><tr>";
            }
          
          },
          error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR + textStatus +  errorThrown)
          }  
        });
        
      };
      console.log(weatherDataArr);
        //console.log(weatherTable);
      console.log(weatherDataArr[0][0]);
        //console.log(weatherTable);
        let countryName =$('#countryDropdown option:selected').text();
        $('#modalTitle').html('Weather Information for: '+countryName);
        //$('#modal-body').append('<table>');
        $('#modal-body').html(weatherDataArr[0]+weatherDataArr[1]);
        //$('#modal-body').append('</table>');
        $('#myModal').modal('toggle');  
      }
    
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR + textStatus +  errorThrown)
    }
        
  });  
  

};*/

// get Info on economy and currency
function getEconomicInformation()  {
  $.ajax({
    url: "libs/php/getCountry.php",
    type: 'POST',
    data: {
      country: $('#countryDropdown').val()
    },
    dataType: 'json',
    success: function(result) {

      if (result.status.name == "ok") {
        let countryName= result['restCountriesData']['name'];
        let countryFlag= result['restCountriesData']['flag'];
        let currencyCode = result['restCountriesData']['currencies'][0]['code'];
        let currencyRate =result['currencyData']['rates'][currencyCode];
        let currencyName = result['restCountriesData']['currencies'][0]['name'];
        let currencySymbol = result['restCountriesData']['currencies'][0]['symbol'];
        
        console.log(currencyCode);
        console.log(result);
        
        $('#modalTitle').html('Economic Information in '+ countryName);
        $('#modalTitle').append('<img id="countryFlag" alt="Flag of Country" src='+countryFlag+'>')
        $('#info1').html("Income Level: "+ result['worldBankData'][1][0]['incomeLevel']['value']);
        $('#info2').html("Currency Name: "+ currencyName);
        $('#info3').html("Exchange Rate: 1USD =  "+ currencyRate+ currencySymbol);
        $('#myModal').modal('toggle')
        $.get('https://openexchangerates.org/api/latest.json', {app_id: '81f4aee418e4422cbf613de699dae46f'}, function(data) {
    console.log("1 US Dollar equals " + data.rates.EUR+ " eur"); 
});


      }
    
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR + textStatus +  errorThrown)
    }
  }); 
}
  
  
 // get Numbers on Emissions of a country
function getEmissions(){
  const d = new Date();
  const startdate = (d.getFullYear()-1)+'-'+(d.getMonth()+1)+'-'+d.getDate(); 
  const enddate=  d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
  $.ajax({
    url: "libs/php/getCountry.php",
    type: 'POST',
    dataType: 'json',
    data: {
        product: 'methane',
        countryCode: $('#countryDropdown').val(),
        startDate: startdate,
        endDate: enddate
      },
    success: function(result) {

      if (result.status.name == "ok") {
        let emissionAverage =(result['emissionData'][0]['value']['average']).toFixed(5);
        $('#modalTitle').html('Emissions (daily average in the last year)')
        $('#info1').html("Methane: "+ emissionAverage+" mol/m<sup>2</sup>");
        $('#myModal').modal('toggle');


      }
    
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR + textStatus +  errorThrown)
    }
  }); 
$.ajax({
  url: "libs/php/getCountry.php",
  type: 'POST',
  dataType: 'json',
  data: {
      product: 'carbonmonoxide',
      countryCode: $('#countryDropdown').val(),
      startDate: startdate,
      endDate: enddate
    },
  success: function(result) {

    if (result.status.name == "ok") {
      let emissionAverage =(result['emissionData'][0]['value']['average']).toFixed(5);
      $('#info2').html("Carbonmonoxide: "+ emissionAverage+" mol/m<sup>2</sup>");
    }
  
  },
  error: function(jqXHR, textStatus, errorThrown) {
    console.log(jqXHR + textStatus +  errorThrown)
  }
});
$.ajax({
  url: "libs/php/getCountry.php",
  type: 'POST',
  dataType: 'json',
  data: {
      product: 'ozone',
      countryCode: $('#countryDropdown').val(),
      startDate: startdate,
      endDate: enddate
    },
  success: function(result) {

    if (result.status.name == "ok") {
      console.log(result);
      let emissionAverage =(result['emissionData'][0]['value']['average']).toFixed(5);
      $('#info3').html("Ozone: "+ emissionAverage+" mol/m<sup>2</sup>");
    }
  
  },
  error: function(jqXHR, textStatus, errorThrown) {
    console.log(jqXHR + textStatus +  errorThrown)
  }
});
$.ajax({
  url: "libs/php/getCountry.php",
  type: 'POST',
  dataType: 'json',
  data: {
      product: 'nitrogendioxide',
      countryCode: $('#countryDropdown').val(),
      startDate: startdate,
      endDate: enddate
    },
  success: function(result) {

    if (result.status.name == "ok") {
      let emissionAverage =(result['emissionData'][0]['value']['average']).toFixed(5);
      $('#info4').html("Nitrogendioxide: "+ emissionAverage +" mol/m<sup>2</sup>");
    }
  
  },
  error: function(jqXHR, textStatus, errorThrown) {
    console.log(jqXHR + textStatus +  errorThrown)
  }
});

};

// get Covid-19 Data 
function getCovidInformation()  {
  $.ajax({
    url: "libs/php/getCountry.php",
    type: 'POST',
    dataType: 'json',
    data: {
        country: $('#countryDropdown option:selected').text()
      },
    success: function(result) {

      console.log(result);

      if (result.status.name == "ok") {
        console.log(result)
        $('modal-body').html('');
        let $table = $('<table>');
        $table.append( '<tr><td>' + 'Confirmed Cases: ' +  result['covidData'][0]['confirmed'] + '</td></tr>' );
        $table.append( '<tr><td>' + 'Critical Cases: ' +  result['covidData'][0]['critical'] + '</td></tr>' );
        $table.append( '<tr><td>' + 'Deaths: ' +  result['covidData'][0]['deaths'] + '</td></tr>' );
        $table.append( '<tr><td>' + 'Recovered: ' +  result['covidData'][0]['recovered'] + '</td></tr>' );
        $table.append( '<tr><td>' + 'Last Update: ' +  result['covidData'][0]['lastUpdate'] + '</td></tr>' );
        $table.append('</table>')

        $('#modalTitle').html('Covid-19 Data for '+ $('#countryDropdown option:selected').text());
        $('#infoDiv').html($table); //$('#modal-body').html()
        $('#myModal').modal('toggle');

      }
    
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR + textStatus +  errorThrown)
    }
  }); 
};

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

      const elecMarkerOption = L.icon({
        iconUrl: "./libs/img/elecLoc.png",
        iconSize: [22, 31],
        iconAnchor: [9, 21],
        popupAnchor: [0, -14]
      });

      const electricIcon ={icon: elecMarkerOption};

      console.log(result);
      console.log($('#countryDropdown').val());
      let elecStationsArr = result['electricData'];
      var markers = new L.MarkerClusterGroup();

      for (var i = 0; i < elecStationsArr.length; i++) {
          let elecStation = elecStationsArr[i]['AddressInfo'];
          let title = elecStation['Title'];
          console.log(elecStation['Latitude']);
           var marker = L.marker([elecStation['Latitude'], elecStation['Longitude']], electricIcon);
            marker.bindPopup(title);
            markers.addLayer(marker);
           //{
             // icon: L.mapbox.marker.icon({'marker-symbol': 'post', 'marker-color': '0044FF'}),
             /* title: title
              .bindPopup(title)
              .addTo(mymap) */
          //});
          //marker.bindPopup(title);
          //markers.addLayer(marker);
      };
      mymap.addLayer(markers);

      
  
      //mymap.addLayer(markers);

    
    
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR + textStatus +  errorThrown)
    }
  }); 
};

$(document).ready(() => {
  main();
});