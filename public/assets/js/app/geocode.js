var geocode = async function(address){
	return new Promise( ( resolve, reject ) => {
		if ( !google ) reject( new Error('google module not loaded.') )
		new google.maps.Geocoder().geocode({'address': address}, function(results, status) {
	    if (status === 'OK') {
	      resolve([ results[0].geometry.location.lng(), results[0].geometry.location.lat()])
	    } else {
	      reject('Geocode was not successful for the following reason: ' + status);
	    }
	  });
	});
}