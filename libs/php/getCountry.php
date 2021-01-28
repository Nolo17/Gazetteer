<?php

	$executionStartTime = microtime(true) / 1000;
	$output = [];

	$countryInfoUrl='http://api.geonames.org/countryInfoJSON?formatted=true&country=' . $_REQUEST['country'] . '&username=nolo23&style=full';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$countryInfoUrl);

	$countryInfoResponse=curl_exec($ch);

	curl_close($ch);

	$countryInfoResult = json_decode($countryInfoResponse,true);	

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "mission saved";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['countryInfoData'] = $countryInfoResult['geonames'];
	
	header('Content-Type: application/json; charset=UTF-8');

	//echo json_encode($output); 

	$restCountriesUrl='https://restcountries.eu/rest/v2/alpha/'.$_REQUEST['country'];
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL, $restCountriesUrl);

	$restCountriesResponse=curl_exec($ch);

	curl_close($ch);

	$restCountriesResult = json_decode($restCountriesResponse,true);
	$restCountry = $restCountriesResult['restCountriesResult'];	
	$output['restCountriesData'] = $restCountriesResult;

	$countryCodeUrl= 'http://api.geonames.org/countryCodeJSON?formatted=true&lat=' . $_REQUEST['lat'] .'&lng='.$_REQUEST['lng']. '&username=nolo23&style=full';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL, $countryCodeUrl);

	$countryCodeResponse=curl_exec($ch);

	curl_close($ch);

	$countryCodeResult = json_decode($countryCodeResponse,true);
	$countryCode = $countryCodeResult['countryCode'];	

	//$output['status']['code'] = "200";
	//$output['status']['name'] = "ok";
	//$output['status']['description'] = "Country Code acquired";
	//$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['countryCodeData'] = $countryCodeResult;

	$citiesUrl ='http://api.geonames.org/searchJSON?country='.$_REQUEST['countryCode'].'&maxRows=10&cities=cities1000&orderby=population&style=LONG&username=nolo23';
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL, $citiesUrl);

	$cityCodeResponse=curl_exec($ch);

	curl_close($ch);

	$cityCodeResult = json_decode($cityCodeResponse,true);
	$cityCode = $cityCodeResult['cityCode'];	
	$output['cityData'] = $cityCodeResult;

	$weatherUrl = 'api.openweathermap.org/data/2.5/weather?q='.$_REQUEST['city'].','.$_REQUEST['countryCode'].'&units=metric&appid=f23619a89b07343b833f164f8d7202a1';
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL, $weatherUrl);

	$weatherResponse=curl_exec($ch);

	curl_close($ch);

	$weatherResult = json_decode($weatherResponse,true);
	$weatherCode = $weatherResult['weather'];	
	$output['weatherData'] = $weatherResult;

	$emissionUrl = 'https://api.v2.emissions-api.org/api/v2/'.$_REQUEST['product'].'/statistics.json?country='.$_REQUEST['countryCode'].'&interval=year&begin='.$_REQUEST['startDate'].'&end='.$_REQUEST['endDate'].'&limit=1';
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL, $emissionUrl);

	$emissionCodeResponse=curl_exec($ch);

	curl_close($ch);

	$emissionCodeResult = json_decode($emissionCodeResponse,true);
	$emissionCode = $emissionCodeResult['emissionCode'];	
	$output['emissionData'] = $emissionCodeResult;

	$covidUrl = 'https://covid19-api.com/country?name='.$_REQUEST['country'].'&format=json';
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL, $covidUrl);

	$covidCodeResponse=curl_exec($ch);

	curl_close($ch);

	$covidCodeResult = json_decode($covidCodeResponse,true);
	$covidCode = $covidCodeResult['covidCode'];	
	$output['covidData'] = $covidCodeResult;

	/*$currencyUrl = 'https://openexchangerates.org/api/latest.json?app_id=81f4aee418e4422cbf613de699dae46f';
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL, $currencyUrl);
	
	$currencyResponse=curl_exec($ch);

	curl_close($ch);

	$currencyResult = json_decode($currencyResponse,true);
	$currencyCode = $currencyResult['covidCode'];	
	$output['currencyData'] = $currencyResult; */

	
	$worldBankUrl = 'http://api.worldbank.org/v2/country/'.$_REQUEST['country'].'?format=json';
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL, $worldBankUrl);

	$worldBankResponse=curl_exec($ch);

	curl_close($ch);

	$worldBankResult = json_decode($worldBankResponse,true);
	$worldBankCode = $worldBankResult['worldBank'];	
	$output['worldBankData'] = $worldBankResult;


	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 


?>