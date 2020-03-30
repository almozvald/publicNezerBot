var logger = require('winston');
var request = require('request');
var url = "https://codeforces.com/api/problemset.problems";
var add="?tags=implementation";
exports.getAllTags = function(channel,num){
	request(url, { json: true }, (err, res, body) => {
		if (err) { 
			logger.info('err!');
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