const app = {};

app.ipAddressFinderUrl = 'https://ipapi.co/json';

app.indeedApiUrl = 'http://api.indeed.com/ads/apisearch';
app.indeedApiKey = '';

app.map;

app.lat = 0;
app.lng = 0;

app.ipAddress = 0;
app.country = '';
app.query = '';
app.location = '';
app.postAge = 0;
app.radius = 0;
app.radiusUnits = 'km';
app.jobType = '';

// Gets IP address
app.getIpAddress = function() {
  $.get(app.ipAddressFinderUrl, function(results) {
    app.ipAddress = results.ip;
  });
}

// Enables the autocomplete dropdown feature
app.enableAutocomplete = function() {
  let input = $('.form__element--location input')[0];
  let searchBox = new google.maps.places.SearchBox(input);

  searchBox.addListener('places_changed', function() {
    let places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }
  });
}

// Gets geolocation and converts it to an address
app.getGeolocation = function() {
  $('.form__element--location .units').html('<i class="fa fa-spinner fa-pulse fa-fw"></i><span class="accessible">Loading...</span>');

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      let myLatLng = {lat: position.coords.latitude, lng: position.coords.longitude};

      let checkInput = setInterval(function() {
        if($('.form__element--location input').val() !== '') {
          clearInterval(checkInput);
          $('.form__element--location .units').html('<i class="fa fa-location-arrow" aria-hidden="true"></i><span class="accessible">Use Current Location</span>');
        }
      }, 500);

      new google.maps.Geocoder().geocode({'location': myLatLng}, function(results, status) {
        if (status === 'OK') {
          $('.form__element--location input').val(results[0].formatted_address);
        }
      });
    });
  }
}

// Checks if No Preference is selected and deselects others if so
app.checkNoPreference = function(that) {
  if(that.is('#noPreference')) {
    $('.form__element--job-type input').prop('checked', false).removeAttr('checked');
    that.prop('checked', true).attr('checked', 'checked');
  } else {
    $('.form__element--job-type input#noPreference').prop('checked', false).removeAttr('checked');
  }
}

// Checks form inputs and removes disabled attribute if they are all filled out
app.checkForm = function() {
  app.query = $('.form__element--query input').val();
  app.location = $('.form__element--location input').val();
  app.postAge = $('.form__element--post-age input').val();
  app.radius = $('.form__element--radius input').val();
  app.radiusUnits = $('.form__element--radius select').val();
  app.jobType = $('.form__element--job-type input[name="jobType"]:checked').map(function() {
    return this.value;
  }).get().join(', ');

  if(app.location !== '') {
    app.getCountry();
  }

  if(app.query !== '' && app.location !== '' && app.postAge !== '' && app.radius !== '' && app.radiusUnits !== '' && app.jobType !== '' && app.country !== '') {
    $('.form__submit').removeAttr('disabled');
	} else {
    $('.form__submit').attr('disabled', 'disabled');
	}

  if(app.jobType === 'nopreference') {
    app.jobType = '';
  }
}

// Gets the country based on the location in the Address/Location input
app.getCountry = function() {
  new google.maps.Geocoder().geocode({'address': app.location}, function(results, status) {
    for (let i = 0; i < results[0].address_components.length; i++) {
      for (let j = 0; j < results[0].address_components[i].types.length; j++) {
        if (results[0].address_components[i].types[j] == 'country') {
          app.country = results[0].address_components[i].short_name.toLowerCase();
        }
      }
    }
  });
}

// Sets the user input location to the center of the map
app.setLocation = function() {
  let location = $('.form__element--location input').val();

  new google.maps.Geocoder().geocode({'address': location}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      app.lat = results[0].geometry.location.lat();
      app.lng = results[0].geometry.location.lng();
    }
  });
}

// Gets all jobs from Indeed API based on user inputs
app.getJobs = function() {
  $.ajax({
		url: app.indeedApiUrl,
		method: 'GET',
		dataType: 'jsonp',
    data: {
      publisher: app.indeedApiKey,
      v: '2',
      format: 'json',
      useragent: navigator.userAgent,
      userip: app.ipAddress,
      limit: '200',
      latlong: '1',
      co: app.country,
      fromage: app.postAge,
      jt: app.jobType,
      l: app.location,
      radius: app.radius,
      q: app.query
    }
  }).then(function(results) {
		console.log(results);

    app.enableMap();
	});
}

// Enables the map and shows it
app.enableMap = function() {
  $('.map').removeClass('map--hidden');

  L.mapbox.accessToken = 'pk.eyJ1Ijoia3Jpc3RlbmtyaWVucyIsImEiOiJjamJsYXY1cW80b3MzMnhxZnVoM3Z4NWs0In0.eAiFLvvJeH2N8DxHWDNWYA';

  app.map = L.mapbox.map('map', 'mapbox.streets').setView([app.lat, app.lng], 12);
}

// Initializes app
app.init = function() {
  app.getIpAddress();
  app.enableAutocomplete();

  $('.form__element--location .units').on('click', function() {
    app.getGeolocation();
  });

  $('.form__element--job-type input').on('click', function() {
    app.checkNoPreference($(this));
  });

  $('.form').on('change', function() {
    app.checkForm();
  });

  $('.form').on('submit', function(e) {
    e.preventDefault();
    app.setLocation();
    app.getJobs();
  });
}

$(function() {
  app.init();
});
