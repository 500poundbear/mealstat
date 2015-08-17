var cheerio = require('cheerio');
var request = require('request');
var escape = require('escape-html');
var prettyjson = require('prettyjson');

var url = 'http://nus.edu.sg/ohs/current-residents/students/dining-daily.php';

request(url, function (err, resp, body){
	if(err){
		throw err;
	}
	$ = cheerio.load(body);
	var pagecontent = $('.page-content').html();
	var mother = {content:[]};
	$('div.day-menu').each(function(){
		//title=[ <date>, <day of week>, meal ]
		var title = ($(this).find('.menu-breakfast h4').html()).split("<br>");
		var breakfast = $(this).find('.menu-breakfast .tbl-menu');
		//console.log(breakfast.html());
		
		$ = cheerio.load(breakfast.html());
		var dailyjson = {
			food:[],
			date:title[0],
			dow: title[1],
			meal:title[2]
		};
		var container = [];
		var currentname;
		$('tr').each(function(i,elem){
			var child = elem.root.children[i];
			if(child.children[0].children[0] && child.children[0].children[0].type==="tag" && child.children[0].children[0].name==="img"){
				//if(child.children[1].children[0].data)console.log(child.children[1].children[0].data);

				if( container.length !== 0 ){
					dailyjson.food.push({name: currentname, items:container});	
					container=[];	
				}
				if( child.children[1].children[0] && child.children[1].children[0].data != "OR"
				  	&& child.children[1].children[0].data != "WITH"){
					
					container.push({
						item: child.children[1].children[0].data
					});	
				}
				currentname = child.children[0].children[0].attribs.alt;
				//console.log(child.children[0].children[0]);
			}else{
				if( child.children[0].children[0] && child.children[0].children[0].data != "OR"
				  	&& child.children[0].children[0].data != "WITH"){
					container.push({
						item: child.children[0].children[0].data
					});	
				}
				//if(child.children[0].children[0])console.log(child.children[0].children[0].data);
			}
		});
		
		if( container.length !== 0 ){
			dailyjson.food.push({name: currentname, items:container});	
			container=[];	
		}
		mother.content.push(dailyjson);
	});
	console.log(prettyjson.render(mother));
});
