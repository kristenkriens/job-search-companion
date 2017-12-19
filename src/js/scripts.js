const app = {};

app.ipAddressFinderUrl = 'http://api.ipify.org?format=json';

app.indeedApiUrl = 'http://api.indeed.com/ads/apisearch';
app.indeedApiKey = '';

app.getIpAddress = function() {
  $.get(app.ipAddressFinderUrl, function(results) {
    app.getJobs(results.ip);
  });
}

app.getJobs = function(ipAddress) {
  $.ajax({
		url: app.indeedApiUrl,
		method: 'GET',
		dataType: 'jsonp',
    data: {
      publisher: app.indeedApiKey,
      v: '2',
      format: 'json',
      useragent: navigator.userAgent,
      userip: ipAddress,
      limit: '200',
      latlong: '1'
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
