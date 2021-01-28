<?php

    $executionStartTime = microtime(true) / 1000;

    $electricUrl='https://api.openchargemap.io/v3/poi/?output=json&countrycode='.$_REQUEST['countryCode'].'&compact=true&verbose=false';
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL, $electricUrl);

	$electricResponse=curl_exec($ch);

	curl_close($ch);

	$electricResult = json_decode($electricResponse,true);
    $electricCar = $electricResult['electricResult'];	
    
    $output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "mission saved";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['electricData'] = $electricResult;

	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>