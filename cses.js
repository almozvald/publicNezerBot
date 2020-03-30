var logger = require('winston');
var people=[];
var ids=[];
var outchannel;
var request = require('request');
var geturl = function(id){
	return 'https://cses.fi/user/'+id+'/'
}
var substrtream = function(all, start, end){
	var begin=all.indexOf(start)+start.length;
	return all.substring(begin).substring(0,all.substring(begin).indexOf(end));
}
var reduceto = function(s,len){
	var messagge='';
	for(var i=0;i<Math.floor((len-s.length)/2);i++){
		messagge+=' ';
	}
	messagge+=s;
	for(var i=0;i<Math.ceil((len-s.length)/2);i++){
		messagge+=' ';
	}
	return messagge;
}
var send=false;
var outputresults = function(){
	if(people.length!=ids.length || send)
		return;
	send=true;
	var ranklen=8;
	var namelen=16;
	var solvedlen=8;
	var messagge='```\n';
	messagge+= reduceto('Ranking',ranklen) + '|'+reduceto('Username',namelen)+ '|' +reduceto('Solved',solvedlen)+ '| Last Submission\n';
	people.sort(function(a, b) {
		if(a.num!=b.num)
		return b.num - a.num;
		return a.lastsubmit.localeCompare(b.lastsubmit);
	});
	for(var i=0;i<people.length;i++){
		people[i].rank=i+1;
		messagge+= reduceto('    '+people[i].rank+'.',ranklen) + '|'+reduceto(people[i].name,namelen)+ '|' +reduceto(''+people[i].num,solvedlen)+ '| '+ people[i].lastsubmit +'\n';
		//messagge+=((i+1) + '.\t\t|' + people[i].name +  '\t\t|' + people[i].num +'\t|'  + people[i].lastsubmit +'\n');
	}
	messagge+='```';
	logger.info('score sended to: ' + outchannel);
	outchannel.send(messagge);
}
var num=0;
var outputdifresults = function(){
	num++;
	if(people.length!=ids.length || num!=ids.length){
		return;
	}
	num=0;
	send=true;
	var ranklen=8;
	var namelen=16;
	var solvedlen=10;
	var messagge='```\n';
	messagge+= reduceto('Ranking',ranklen) + '|'+reduceto('Username',namelen)+ '|' +reduceto('Solved',solvedlen)+ '| Last Submission\n';
	people.sort(function(a, b) {
		if(a.num!=b.num)
		return b.num - a.num;
		return a.lastsubmit.localeCompare(b.lastsubmit);
	});
	var alldiff=0;
	for(var i=0;i<people.length;i++){
		var difchar='-';
		if(people[i].rank!=9999 && people[i].rank>i+1){
			difchar='↑'
		}
		if(people[i].rank!=9999 && people[i].rank<i+1){
			difchar='↓'
		}
		alldiff+=people[i].diff;
		var extra='';
		if(people[i].diff > 0){
			extra=' +'+people[i].diff;
		}
		people[i].rank=i+1;
		messagge+= reduceto(' '+difchar+' '+people[i].rank+'.',ranklen) + '|'+reduceto(people[i].name,namelen)+ '|' +reduceto(people[i].num+extra,solvedlen)+ '| '+ people[i].lastsubmit +'\n';
		//messagge+=((i+1) + '.\t\t|' + people[i].name +  '\t\t|' + people[i].num +'\t|'  + people[i].lastsubmit +'\n');
	}
	messagge+='```';
	logger.info('score sended to: ' + outchannel);
	if(alldiff==0){
		logger.info('but nothing changed');
		messagge= 'התוצאות לא השתנו בכלל תפתרו עוד שאלות!';
	}
	outchannel.send(messagge);
}
var globalchecksum;
var loadresults = function(then){
	globalchecksum=Math.floor(Math.random()*1489124);
	var curchecksum=globalchecksum;
	for(var i=0;i<people.length;i++){
		people[i].loaded=false;
	}
	for(var j=0;j<2;j++){
		for(var i=0;i<ids.length;i++){
			request(geturl(ids[i]), { json: true }, (err, res, body) => {
				if (err) { 
					logger.info('err!');
					return;
				}
				if(curchecksum!=globalchecksum){
					logger.info('late request please ignore');
					return;
				}
				ans= body;
				var id=substrtream(ans,'<a href="/problemset/user/','/">');
				for(var i=0;i<people.length;i++){
					if(people[i].id==id&&people[i].loaded){
						logger.info('multiple request please ignore');
						return;
					}
				}
				var name=substrtream(ans,'<title>CSES - User ','</title>');
				var num=substrtream(ans,'<tr><td >CSES Problem Set</td><td ><a href="/problemset/user/'+id +'/">','</a></td></tr>');
				num=Number(num);
				var lastsubmit=substrtream(ans,'<tr><td >Last submission</td><td >','</td></tr>');
				//num= num.praseInt(10);
				var person={};
				person.id=id;
				person.num=num;
				person.name=name;
				person.lastsubmit=lastsubmit;
				person.rank=9999;
				person.diff=0;
				person.loaded=true;
				var found=false;
				for(var i=0;i<people.length;i++){
					if(people[i].id==id){
						person.rank=people[i].rank;
						person.diff=num-people[i].num;
						people[i]=person;
						found=true;
						break;
					}
				}
				if(!found){
					people.push(person);
				}
				logger.info('Id: '+id+'\nName: '+name+'\n'+'Problems solved: '+num + '\n' +'Last submission: '+lastsubmit + '\n');
				then();
			});
		}
	}
}
exports.results = function(channel,id){
	outchannel=channel;
	ids=id;
	logger.info(people);
	people.splice(0,people.length);
	if(ids.length==0){
		outchannel.send('שגיאה! פחות מדי אנשים');
		return;
	}
	send=false;
	loadresults(outputresults);
}
exports.difresults = function(channel,id){
	num=0;
	outchannel=channel;
	ids=id;
	logger.info(people);
	if(people.length!=ids.length){
		outchannel.send('אין נתונים מלאים להשוות עליהם');
		people.splice(0,people.length);
		loadresults(outputresults);
		return;
	}
	send=false;
	loadresults(outputdifresults);
}
