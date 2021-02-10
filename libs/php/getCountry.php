<?php

	$executionStartTime = microtime(true) / 1000;
	$output = [];

	$countryInfoUrl='http://api.geonames.org/countryInfoJSON?formatted=true&country=' . $_REQUEST['country'] . '&username=nolo23&style=full';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL, $countryInfoUrl);

	$countryInfoResponse=curl_exec($ch);

	$countryInfoResult = json_decode($countryInfoResponse,true);
	
	$countryCode = $countryInfoResult['geonames']['0']['countryCode'];

	$output['countryInfoData'] = [$countryInfoResult['geonames']['0']['areaInSqKm'], $countryInfoResult['geonames']['0']['capital'], $countryInfoResult['geonames']['0']['population'], $countryInfoResult['geonames']['0']['countryName']];
	
	$restCountriesUrl='https://restcountries.eu/rest/v2/alpha/'.$_REQUEST['country'];

	curl_setopt($ch, CURLOPT_URL, $restCountriesUrl);

	$restCountriesResponse=curl_exec($ch);

	$restCountriesResult = json_decode($restCountriesResponse,true);
	$restCountry = [$restCountriesResult['currencies'], $restCountriesResult['languages'], $restCountriesResult['flag'] ];	
	$output['restCountriesData'] = $restCountry;


	$citiesUrl ='http://api.geonames.org/searchJSON?country='.$_REQUEST['country'].'&maxRows=10&cities=cities1000&orderby=population&style=LONG&username=nolo23';
	curl_setopt($ch, CURLOPT_URL, $citiesUrl);

	$cityCodeResponse=curl_exec($ch);


	$cityCodeResult = json_decode($cityCodeResponse,true);
	$cityCode = $cityCodeResult['geonames'];

	$cities =[];
	foreach ($cityCode as $city) {

	$info['name'] = $city['name'];
	$info['population']= $city['population'];
	$info['lat']= $city['lat'];
	$info['lng']= $city['lng'];

    array_push($cities, $info);  

}
	$output['cityData'] = $cities;

    $weatherCities=[];
	foreach ($cities as $city) {

		$weatherUrl = 'api.openweathermap.org/data/2.5/weather?lat='.$city{'lat'}.'&lon='.$city{'lng'}.'&units=metric&appid=f23619a89b07343b833f164f8d7202a1';
	
	    curl_setopt($ch, CURLOPT_URL, $weatherUrl);

	    $weatherResponse=curl_exec($ch);


		$weatherResult = json_decode($weatherResponse,true);
		
		$weatherforCity=[];
		array_push($weatherforCity, $weatherResult['main'], $weatherResult['weather']);
	
		array_push($weatherCities, $weatherforCity);
	
	
	}

	$output['weatherData'] = $weatherCities;

	
	
	

	$covidUrl = 'https://covid19-api.com/country/code?code='.$_REQUEST['country'].'&format=json';
	curl_setopt($ch, CURLOPT_URL, $covidUrl);

	$covidCodeResponse=curl_exec($ch);


	$covidCodeResult = json_decode($covidCodeResponse,true);
	$covidInfo = [$covidCodeResult[0]['confirmed'],$covidCodeResult[0]['critical'], $covidCodeResult[0]['deaths'], $covidCodeResult[0]['recovered'], $covidCodeResult[0]['lastUpdate']];	
	$output['covidData'] = $covidInfo;

	$currencyUrl = 'https://openexchangerates.org/api/latest.json?app_id=81f4aee418e4422cbf613de699dae46f';
	curl_setopt($ch, CURLOPT_URL, $currencyUrl);
	
	$currencyResponse=curl_exec($ch);


	$currencyResult = json_decode($currencyResponse,true);
	$currencyCode = $currencyResult['rates'][$restCountriesResult['currencies'][0]['code']];	
	$output['currencyData'] = $currencyCode; 

	
	$worldBankUrl = 'http://api.worldbank.org/v2/country/'.$_REQUEST['country'].'?format=json';
	curl_setopt($ch, CURLOPT_URL, $worldBankUrl);

	$worldBankResponse=curl_exec($ch);

	$worldBankResult = json_decode($worldBankResponse,true);
	$worldBankCode = $worldBankResult['worldBank'];	
	$output['worldBankData'] = $worldBankResult[1][0]['incomeLevel']['value'];

	$emissionArray=[];

    $products = ['methane', 'carbonmonoxide', 'ozone','nitrogendioxide'];

    foreach($products as $product){
        $emissionUrl = 'https://api.v2.emissions-api.org/api/v2/'.$product.'/statistics.json?country='.$_REQUEST['country'].'&interval=year&begin='.$_REQUEST['startDate'].'&end='.$_REQUEST['endDate'].'&limit=1';
	    curl_setopt($ch, CURLOPT_URL, $emissionUrl);

	   $emissionResponse=curl_exec($ch);

	   $emissionResult = json_decode($emissionResponse,true);
	   $emission= $emissionResult[0]['value']['average'];
       array_push($emissionArray,$emission);

	}

	curl_close($ch);
	$output['emissionData'] = $emissionArray;

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "mission saved";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";


	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 


?>