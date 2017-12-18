const app = {};

app.indeedApiUrl = 'http://api.indeed.com/ads/apisearch';
app.indeedApiKey = '';

app.getIpAddress = function() {
  $.ajax({
		url: app.ipAddressFinderUrl,
		method: 'GET',
		dataType: 'json'
	}).then(function(address) {
		app.getJobs(address.ip);
	});
}

app.getJobs = function(ipAddress) {
  $.ajax({
		url: indeedApiUrl,
		method: 'GET',
		dataType: 'jsonp',
    data: {
      publisher: app.indeedApiKey,
      v: '2',
      format: 'json',
      useragent: navigator.userAgent,
      userip: ipAddress,
      limit: '200',
      latLong: '1'
    }
	}).then(function(results) {
		console.log(results);
	});
}

// Initializes app
app.init = function() {
  app.getIpAddress();
}

$(function() {
  app.init();
});
