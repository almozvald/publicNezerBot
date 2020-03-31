var logger = require('winston');
var request = require('request');
var Discord = require('discord.js');
var url = "https://codeforces.com/api/problemset.problems";
var add="?tags=";
exports.getAllTags = function(channel,num){
	channel.send('זה יכול לקחת קצת זמן היעזר בסבלנות');
	request(url, { json: true }, (err, res, body) => {
		if (err) { 
			logger.info('err!');
			channel.send('error accseing site!');
			return;
		}
		//logger.info(body);
		var all=body;
		var tags=[];
		var shows=[];
		//logger.info(body);
		for(var i=0;i<all.result.problems.length;i++){
			for(var j=0;j<all.result.problems[i].tags.length;j++){
				var current=all.result.problems[i].tags[j];
				var ind=tags.indexOf(current);
				if(ind==-1){
					tags.push(current);
					shows.push(1);
				}else{
					shows[ind]++;
				}
			}
		}
		var message='';
		var found=0;
		for(var i=0;i<tags.length;i++){
			if(shows[i]>=num){
				message+=tags[i]+', ';
				found++;
			}
		}
		if(found==0){
			channel.send('לא מצאתי אף תאג בכמות כזאת של שאלות');
		}else{
			channel.send('מצאתי '+found+' תאגים\n'+message);
		}
	});
}
exports.getGetRandomquestion = function(channel,args){
	var funcarr=[];
	var cururl=url;
	for(var i=0;i<args.length;i++){
		if(args[i]=='help'){
			var message='';
			var documntation=['מצורפת רשימה של כל הארגומנטים החוקיים:',
			'help '+' קבל את ההודעה הזאת',
			'tags:[tags] '+'רשימת תאגים אשר מופרדים בסימני נקודה פסיק והרווחים מוחלפים בקו תחתון',
			'minrating:rating'  + ' הגבל את החיפוש לשאלות שדירוג הקושי שלהם הוא לפחות זה',
			'maxrating:rating'  + ' הגבל את החיפוש לשאלות שדירוג הקושי שלהם הוא לכל היותר זה'];
			for(var i=0;i<documntation.length;i++){
				message += documntation[i]+'\n';
			}
			channel.send(message);
			return;
		}else if(args[i].substring(0,5)=='tags:'){
			cururl+=add;
			for(var j=5;j<args[i].length;j++){
				if(args[i][j]!='_'){
					cururl+=args[i][j];
				}else{
					cururl+=' ';
				}
			}
		}else if(args[i].substring(0,10)=='minrating:'){
			var num=Number(args[i].substring(10));
			funcarr.push(function(obj){
				return obj.rating>=num;
			});
		}else if(args[i].substring(0,10)=='maxrating:'){
			var num=Number(args[i].substring(10));
			funcarr.push(function(obj){
				return obj.rating<=num;
			});
		}else{
			channel.send('err: '+ args[i] + 'is not a valid argument');
		}
	}
	channel.send('זה יכול לקחת קצת זמן היעזר בסבלנות');
	logger.info(cururl);
	request(cururl, { json: true }, (err, res, body) => {
		if (err) { 
			logger.info('err!');
			channel.send('error accseing site!');
			return;
		}
		var all=body;
		var rand=Math.floor(all.result.problems.length*Math.random());
		for(var i=0;i<all.result.problems.length;i++){
			var ok=true;
			for(var j=0;j<funcarr.length;j++){
				if(!funcarr[j](all.result.problems[(i+rand)%all.result.problems.length])){
					ok =false;
				}
			}
			if(ok){
				if(Math.random()<0.1){
					const embed = new Discord.MessageEmbed()
					.setTitle('הנה שאלה בשבילך')
					.setColor(0x0000ff)
					.setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
					channel.send(embed);
				}else{
					const embed = new Discord.MessageEmbed()
					.setTitle('הנה שאלה בשבילך')
					.setColor(0x0000ff)
					.setURL('https://codeforces.com/contest/'+all.result.problems[(i+rand)%all.result.problems.length].contestId+'/problem/'+all.result.problems[(i+rand)%all.result.problems.length].index);
					channel.send(embed);
				}
				return
			}
		}
		channel.send('לא נמצאה אף שאלה אשר עונה לקריטריונים');
	});
}
