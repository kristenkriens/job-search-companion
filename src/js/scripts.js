const app = {};

app.ipAddressFinderUrl = 'https://ipapi.co/json';

app.indeedApiUrl = 'http://api.indeed.com/ads/apisearch';
app.indeedApiKey = '';

app.loggedIn = false;
app.name = '';
app.email = '';
app.password = '';

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

// Initializes Firebase
app.initializeFirebase = function() {
  firebase.initializeApp({
    apiKey: "AIzaSyD8o9rQ1n2v-6uMZ3NRWpiGUUb38AKryNc",
    authDomain: "job-search-compa-1514144240150.firebaseapp.com",
    databaseURL: "https://job-search-compa-1514144240150.firebaseio.com",
    projectId: "job-search-compa-1514144240150",
    storageBucket: "",
    messagingSenderId: "1065267185812"
  });
}

// Generates an overlay
app.generateOverlay = function(context, text) {
  $('.overlay').fadeOut(250, function() {
    $(this).remove();
  });

  if(context === 'login') {
    $(`<div class="overlay overlay--login">
      <div class="overlay__content">
        <button class="overlay__close"><i class="fa fa-times" aria-hidden="true"></i></button>
        <h2>Login</h2>
        <form class="overlay__form">
          <div class="form__element">
            <label for="email">Email</label>
            <input type="email" id="email" placeholder="e.g. fake-email@gmail.com">
          </div>
          <div class="form__element">
            <label for="password">Password</label>
            <input type="password" id="password">
          </div>
          <button class="overlay__submit" disabled>Submit</button>
          <p class="overlay__link">New user? Create an account</p>
        </form>
      </div>
    </div>`).hide().appendTo('body').fadeIn(500);
  } else if(context === 'create-account') {
    $(`<div class="overlay overlay--create-account">
      <div class="overlay__content">
        <button class="overlay__close"><i class="fa fa-times" aria-hidden="true"></i></button>
        <h2>Create Acount</h2>
        <form class="overlay__form">
          <div class="form__element">
            <label for="name">Name</label>
            <input type="text" id="name">
          </div>
          <div class="form__element">
            <label for="email">Email</label>
            <input type="email" id="email" placeholder="e.g. fake-email@gmail.com">
          </div>
          <div class="form__element">
            <label for="password">Password</label>
            <input type="password" id="password">
          </div>
          <div class="form__element">
            <label for="reEnterPassword">Re-enter Password</label>
            <input type="password" id="reEnterPassword">
          </div>
          <button class="overlay__submit" disabled>Submit</button>
          <p class="overlay__link">Already have an account? Login</p>
        </form>
      </div>
    </div>`).hide().appendTo('body').fadeIn(500);
  } else if(context === 'text') {
    $(`<div class="overlay overlay--error">
      <div class="overlay__content">
        <button class="overlay__close"><i class="fa fa-times" aria-hidden="true"></i></button>
        <h2>Error</h2>
        <p>${text}</p>
      </div>
    </div>`).hide().appendTo('body').fadeIn(500);
  }
}

// Removes the overlay
app.removeOverlay = function(that) {
  $('.overlay').fadeOut(250, function() {
    $(this).remove();
  });
}

// Checks if email address is valid
app.checkEmail = function(email) {
  let testEmail = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;

  if(testEmail.test(email) && email !== '') {
    return true;
  } else {
    return false;
  }
}

// Checks overlay form inputs and removes disabled attribute if they are all filled out
app.checkOverlayForm = function() {
  app.email = $('.overlay input#email').val();
  app.password = $('.overlay input#password').val();

  if($('.overlay').hasClass('overlay--create-account')) {
    app.name = $('.overlay--create-account input#name').val();
    let reEnterPassword = $('.overlay--create-account input#reEnterPassword').val();

    if(app.name !== '' && app.checkEmail(app.email) && app.password !== '' && (app.password === reEnterPassword)) {
      $('.overlay__submit').removeAttr('disabled');
  	} else {
      $('.overlay__submit').attr('disabled', 'disabled');
  	}
  } else if($('.overlay').hasClass('overlay--login')) {
    if(app.checkEmail(app.email) && app.password !== '') {
      $('.overlay__submit').removeAttr('disabled');
  	} else {
      $('.overlay__submit').attr('disabled', 'disabled');
  	}
  }
}

// Creates a user account
app.createAccount = function() {
  app.email = $('.overlay--create-account input#email').val();
  app.password = $('.overlay--create-account input#password').val();
  app.name = $('.overlay--create-account input#name').val();

  $('.overlay__submit').html('Submit <i class="fa fa-spinner fa-pulse fa-fw"></i><span class="accessible">Loading...</span>');

  firebase.auth().createUserWithEmailAndPassword(app.email, app.password).then(function(user) {
    app.generateOverlay('login');

    return user.updateProfile({displayName: app.name});
  }).catch(function(error) {
    app.generateOverlay('text', error.message);
  });
}

// Logs user into their account
app.login = function() {
  app.email = $('.overlay--login input#email').val();
  app.password = $('.overlay--login input#password').val();

  $('.overlay__submit').html('Submit <i class="fa fa-spinner fa-pulse fa-fw"></i><span class="accessible">Loading...</span>');

  firebase.auth().signInWithEmailAndPassword(app.email, app.password).then(function() {
    app.loggedIn = true;
    app.checkLoggedIn();
    app.removeOverlay();
  }).catch(function(error) {
    app.generateOverlay('text', error.message);
  });
}

// Logs the user out
app.logout = function() {
  firebase.auth().signOut().then(function() {
    app.loggedIn = false;
    app.checkLoggedIn();
  }).catch(function(error) {
    app.generateOverlay('text', error.message);
  });
}

// Gets user data from Firebase
app.getUserData = function() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      app.name = user.displayName;

      $('.topbar__profile-name').text(app.name);
    }
  });
}

// Checks if the user is logged in and shows the correct topbar info
app.checkLoggedIn = function() {
  if(app.loggedIn) {
    $('body').addClass('logged-in').removeClass('logged-out');

    app.getUserData();
  } else {
    $('body').addClass('logged-out').removeClass('logged-in');
  }
}

// Gets IP address
app.getIpAddress = function() {
  $.get(app.ipAddressFinderUrl, function(results) {
    app.ipAddress = results.ip;
  });
}

// Enables the autocomplete dropdown feature
app.enableAutocomplete = function() {
  let input = $('#location')[0];
  let searchBox = new google.maps.places.SearchBox(input);

  searchBox.addListener('places_changed', function() {
    let places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }
  });
}

// Toggles the profile dropdown menu
app.toggleProfileDropdown = function() {
  $('.topbar__profile-dropdown').fadeToggle();

  $('.topbar__profile-status--logged-in .fa').toggleClass('fa-angle-down fa-angle-up');
}

// Gets geolocation and converts it to an address
app.getGeolocation = function() {
  $('#location + .units').html('<i class="fa fa-spinner fa-pulse fa-fw"></i><span class="accessible">Loading...</span>');

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      let myLatLng = {lat: position.coords.latitude, lng: position.coords.longitude};

      let checkInput = setInterval(function() {
        if($('#location').val() !== '') {
          clearInterval(checkInput);
          $('#location + .units').html('<i class="fa fa-location-arrow" aria-hidden="true"></i><span class="accessible">Use Current Location</span>');
        }
      }, 500);

      new google.maps.Geocoder().geocode({'location': myLatLng}, function(results, status) {
        if (status === 'OK') {
          $('#location').val(results[0].formatted_address);
        }
      });
    });
  }
}

// Checks if No Preference is selected and deselects others if so
app.checkNoPreference = function(that) {
  if(that.is('#noPreference')) {
    $('input[name="jobType"]').prop('checked', false).removeAttr('checked');
    that.prop('checked', true).attr('checked', 'checked');
  } else {
    $('input[name="jobType"]#noPreference').prop('checked', false).removeAttr('checked');
  }
}

// Checks search form inputs and removes disabled attribute if they are all filled out
app.checkSearchForm = function() {
  app.query = $('input#query').val();
  app.location = $('#location').val();
  app.postAge = $('input#postAge').val();
  app.radius = $('input#radius').val();
  app.radiusUnits = $('select#radiusUnits').val();
  app.jobType = $('input[name="jobType"]:checked').map(function() {
    return this.value;
  }).get().join(', ');

  if(app.location !== '') {
    app.getCountry();
  }

  if(app.query !== '' && app.location !== '' && app.postAge !== '' && app.radius !== '' && app.radiusUnits !== '' && app.jobType !== '' && app.country !== '') {
    $('.content-inner--search .form__submit').removeAttr('disabled');
	} else {
    $('.content-inner--search .form__submit').attr('disabled', 'disabled');
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

// Gets the user input location to the center of the map
app.getLocation = function() {
  let location = $('#location').val();

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
  L.mapbox.accessToken = 'pk.eyJ1Ijoia3Jpc3RlbmtyaWVucyIsImEiOiJjamJsYXY1cW80b3MzMnhxZnVoM3Z4NWs0In0.eAiFLvvJeH2N8DxHWDNWYA';

  app.map = L.mapbox.map('map', 'mapbox.streets').setView([app.lat, app.lng], 12);
}

// Checks analyze form textarea and removes disabled attribute if it is filled out
app.checkAnalyzeForm = function() {
  if($('textarea#correspondence').val() !== '') {
    $('.content-inner--analyze-correspondence .form__submit').removeAttr('disabled');
  } else {
    $('.content-inner--analyze-correspondence .form__submit').attr('disabled', 'disabled');
  }
}

// Opens and closes the primary item in the sidebar
app.togglePrimaryItem = function(that) {
  $('.sidebar__primary-item').not(that).removeClass('sidebar__primary-item--open').next().slideUp();

  that.toggleClass('sidebar__primary-item--open').next().slideToggle();
}

// Changes the current main content view to the clicked on item, sets the text in the breadcrumb, and hides the current text if specified
app.setCurrentView = function(that, empty) {
  let classList = that.attr('class').split(/\s+/);
  let current = classList[1].substring(classList[1].indexOf("--") + 2);

  $('body').removeClass().addClass((app.loggedIn ? 'logged-in ' + current : 'logged-out ' + current));

  let currentParentText = that.parent().prev().text();
  let currentText = that.text();

  $('.topbar__current-parent').text(currentParentText);
  $('.topbar__current-self').text(currentText);

  if(empty) {
    $('.content-inner--' + current).empty();
  }
}

// Initializes app
app.init = function() {
  app.initializeFirebase();
  app.checkLoggedIn();
  app.setCurrentView($('.sidebar__secondary-item--search'));
  app.getIpAddress();
  app.enableAutocomplete();

  $('.sidebar__primary-item').on('click', function() {
    app.togglePrimaryItem($(this));
  });

  $('.sidebar__secondary-item').on('click', function() {
    app.setCurrentView($(this));
  });

  $('.topbar__profile-status--logged-in').on('click', function() {
    app.toggleProfileDropdown();
  });

  $('body').on('click', '.overlay__close', function() {
    app.removeOverlay();
  });

  $('.login').on('click', function() {
    app.generateOverlay('login');
  });

  $('body').on('click', '.overlay--login .overlay__link', function() {
    app.generateOverlay('create-account');
  });

  $('body').on('click', '.overlay--create-account .overlay__link', function() {
    app.generateOverlay('login');
  });

  $('body').on('submit', '.overlay--create-account form', function(e) {
    e.preventDefault();

    app.createAccount();
  });

  $('body').on('submit', '.overlay--login form', function(e) {
    e.preventDefault();

    app.login();
  });

  $('body').on('change keyup', '.overlay form', function() {
    app.checkOverlayForm();
  });

  $('.logout').on('click', function() {
    app.logout();
  });

  $('input#location + .units').on('click', function() {
    app.getGeolocation();
  });

  $('input[name="jobType"]').on('click', function() {
    app.checkNoPreference($(this));
  });

  $('.content-inner--search form').on('change keyup', function() {
    app.checkSearchForm();
  });

  $('.content-inner--analyze-correspondence form').on('change keyup', function() {
    app.checkAnalyzeForm();
  });

  $('.content-inner--search form').on('submit', function(e) {
    e.preventDefault();

    app.getLocation();
    app.getJobs();
    app.setCurrentView($('.sidebar__secondary-item--map'), true);
  });
}

$(function() {
  app.init();
});
