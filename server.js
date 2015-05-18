//Lets require/import the HTTP module
var http = require('http');
var assert = require('assert');
var Browser = require('zombie');
var forEach = require('async-foreach').forEach;

var express = require('express');
var app = express();
var path = require('path');

var is_work_crawler_university = false;
var is_work_crawler_students = false;

students = {};
var rank_ufrrj;
var points_ufrrj;
var total_students;
var CronJob = require('cron').CronJob;

new CronJob('0 * * * * *', function () {
    console.log('Rodando ZombieJS...');
    uri_crawler_university();
    uri_crawler_students();
}, null, true, 'America/Los_Angeles');

app.get('/uri', function (req, res) {
    var estatistica = {};
    estatistica["ufrrj"] = rank_ufrrj;
    estatistica["p_ufrrj"] = points_ufrrj;
    estatistica["t_ufrrj"] = total_students;
    var all_students = [];

    for (var value in students){
        var student = new Object();
        student["name"] = students[value].name;
        student["problems"] = students[value].points;
        student["profile"] = students[value].profile_link;
        all_students.push(student);
    }
    estatistica["students"] = all_students;
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.stringify(estatistica));
});

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
});


function uri_crawler_university() {
    var my_browser = new Browser(); // Here's where you need to call new
    var url = "https://www.urionlinejudge.com.br/judge/en/universities/index/page:"
    var is_found = false;

    var page = 1;
    var last_page = 5;

    if(!is_work_crawler_university) {
        is_work_crawler_university = true;

        (function loop() {
            if (page <= last_page && !is_found) {
                my_browser.visit(url + page, function (e, browser) {
                    if (my_browser.success) {
                        console.log("UPage " + page);
                        var $ = my_browser.window.$;
                        if (!(typeof $ === 'undefined')) {
                            table = $('#element tr').each(function () {
                                var cellText = $(this).find(".acronym");

                                if (cellText.text().trim() == "UFRRJ") {
                                    rank_ufrrj = $(this).children('td').slice(0, 1).text();
                                    points_ufrrj = $(this).find(".tiny").text().trim();
                                    total_students = $(this).find(".medium").eq(1).text().trim();;
                                    console.log(rank_ufrrj+", "+points_ufrrj+", "+total_students);
                                    is_found = true;
                                }
                            });
                        }
                    }
                    else {
                        console.log("Error")
                    }

                    page++;
                    loop();
                });
            } else {
                is_work_crawler_university = false;
            }
        }());
    }
}

//Top 10 of UFRRJ
function uri_crawler_students() {
    var my_browser = new Browser(); // Here's where you need to call new
    var url = "https://www.urionlinejudge.com.br/judge/pt/statistics/university/ufrrj";
    var top = 10; //show only top 10 students

    my_browser.visit(url, function (e, browser) {
        if (my_browser.success) {
            var $ = my_browser.window.$;
            
            if (!(typeof $ === 'undefined')) {
                var elem = $('table tr');
                
                elem.each(function(i){
                	if(i>0 && i<=top){//skips i==0 -> table header
                		var student = {
                			name: $(this).find("a").text().trim(),
                			points: $(this).find(".medium").eq(1).text().trim(),
                			profile_link: $(this).find("a").attr("href"),
                			general_rank: 0
                		}
                		students[i-1]=student;
                	}
                	if (i === top+1) {
                		//console.log(students);
                		return 0;
                	}
                });
            }
        }
        else {
            console.log("Error");
        }
    });
}
