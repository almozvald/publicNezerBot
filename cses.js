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
var globalchecksum;
var loadresults = function(then){
	globalchecksum=Math.floor(Math.random()*1489124);
	var curchecksum=globalchecksum;
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