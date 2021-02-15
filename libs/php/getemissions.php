<?php


	$executionStartTime = microtime(true) / 1000;
	$output = [];
	$emissionArray =[];
    
    $products = ['methane', 'carbonmonoxide', 'ozone','nitrogendioxide'];

    foreach($products as $product){
        $emissionUrl = 'https://api.v2.emissions-api.org/api/v2/'.$product.'/statistics.json?country='.$_REQUEST['country'].'&interval=year&begin='.$_REQUEST['startDate'].'&end='.$_REQUEST['endDate'].'&limit=1';
        $ch = curl_init();
	    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
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