<?php


	$executionStartTime = microtime(true) / 1000;
	$output = [];

	$countryCodeUrl= 'http://api.geonames.org/countryCodeJSON?formatted=true&lat=' . $_REQUEST['lat'] .'&lng='.$_REQUEST['lng']. '&username=nolo23&style=full';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL, $countryCodeUrl);

	$countryCodeResponse=curl_exec($ch);

	curl_close($ch);

	$countryCodeResult = json_decode($countryCodeResponse,true);
    $countryCode = $countryCodeResult['countryCode'];	
    $output['countryCodeData'] = $countryCode;
    
    $output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "mission saved";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
 


	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 
	


?>