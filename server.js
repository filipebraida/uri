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

var rank_ufrrj = 500;
var students = new Object()

var CronJob = require('cron').CronJob;
new CronJob('0 * * * * *', function () {
    console.log('Rodando ZombieJS...');
    uri_crawler_university();
    uri_crawler_students();
    console.log('Resultado:' + rank_ufrrj);
}, null, true, 'America/Los_Angeles');

app.get('/uri', function (req, res) {
    var estatistica = {};
    estatistica["ufrrj"] = rank_ufrrj;

    var all_students = new Array();

    for (var value in students){
        var student = new Object();
        student["name"] = value;
        student["problems"] = students[value];
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

    console.log('Example app listening at http://%s:%s', host, port);
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
                                    console.log(rank_ufrrj);
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

function uri_crawler_students() {
    var my_browser = new Browser(); // Here's where you need to call new
    var url = "https://www.urionlinejudge.com.br/judge/en/rank/page:"

    var page = 1;
    var last_page = 600;

    if(!is_work_crawler_students) {
        is_work_crawler_students = true;

        (function loop() {
            if (page <= last_page) {
                my_browser.visit(url + page, function (e, browser) {
                    if (my_browser.success) {
                        console.log("APage " + page);
                        var $ = my_browser.window.$;
                        if (!(typeof $ === 'undefined')) {
                            $('#element tr td:nth-child(3)').each(function () {
                                var name = $(this).text().trim();

                                if (name.indexOf("[UFRRJ]") == 0) {
                                    name = name.slice(8);
                                    students[name] = $(this).closest('td').next().text().trim();
                                    console.log(students);
                                }
                            });
                        }
                    }
                    else {
                        console.log("Error");
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

