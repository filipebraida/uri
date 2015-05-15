//Lets require/import the HTTP module
var http = require('http');
var assert = require('assert');
var Browser = require('zombie');
var forEach = require('async-foreach').forEach;

var express = require('express');
var app = express();
var path = require('path');
var rank_ufrrj = 500;

var CronJob = require('cron').CronJob;
new CronJob('0 * * * * *', function() {
	console.log('Rodando ZombieJS...');
	uri_crawler();
	console.log('Resultado:' + rank_ufrrj);
}, null, true, 'America/Los_Angeles');

app.get('/uri', function (req, res) {
        var estatistica = {};
        estatistica["ufrrj"] = rank_ufrrj;
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify(estatistica));
});

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname + '/index.html'));
});

var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});


function uri_crawler() {
        my_browser = new Browser(); // Here's where you need to call new
	url = "https://www.urionlinejudge.com.br/judge/en/universities/index/page:"
	is_found = false;

	var page = 2;
	var last_page = 5;

	(function loop() {
	    if (page <= last_page && !is_found) {
                my_browser.visit(url + page, function(e, browser) {
	                assert.ok(my_browser.success);
	                console.log("Page " + page);
	                var $ = my_browser.window.$;
	                table = $('#element tr').each(function() {
	                        var cellText = $(this).find(".acronym");

	                        if(cellText.text().trim() == "UFRRJ")
	                        {
	                                rank_ufrrj = $(this).children('td').slice(0, 1).text();
	                                console.log(rank_ufrrj);
					is_found = true;
	                        }
	                });
	
		page++;
		loop();
                });
	    }
	}());
}
