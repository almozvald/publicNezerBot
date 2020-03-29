var Discord = require('discord.js');
var logger = require('winston');
var auth = require('./auth.json');
var data = require('./data.json');
var request = require('request');
const client = new Discord.Client();
client.login(auth.token);
'use strict';
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
var name='nezerbot!';
var ids=[];
client.on('ready', () => {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(client.user.username + ' - (' + client.user.id + ')');
	ids = data.ids;
});



var geturl = function(id){
	return 'https://cses.fi/user/'+id+'/'
}
var ans;
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

var curchannel;
var substrtream = function(all, start, end){
	var begin=all.indexOf(start)+start.length;
	return all.substring(begin).substring(0,all.substring(begin).indexOf(end));
}
var people=[];

var snapcontent = function(id){
	logger.info(geturl(id));
	request(geturl(id), { json: true }, (err, res, body) => {
		if (err) { 
			logger.info('err!');
			return;
		}
		//logger.info(body.url);
		ans= body;
		var name=substrtream(ans,'<title>CSES - User ','</title>');
		var num=substrtream(ans,'<tr><td >CSES Problem Set</td><td ><a href="/problemset/user/'+id +'/">','</a></td></tr>');
		num=Number(num);
		var lastsubmit=substrtream(ans,'<tr><td >Last submission</td><td >','</td></tr>');
		//num= num.praseInt(10);
		curchannel.send('Id: '+id+'\nName: '+name+'\n'+'Problems solved: '+num + '\n' +'Last submission: '+lastsubmit + '\n');
	});
	//logger.info(ans);
	//return ans;
}
var addid = function(id){
	for(var i=0;i<ids.length;i++){
		if(ids[i]==id){
			logger.info('Id: '+id+' not added because multiple');
			return;
		}
	}
	ids.push(id);
}
var removeid = function(id){
	var newids=[];
	for(var i=0;i<ids.length;i++){
		if(ids[i]!=id){
			newids.push(ids[i]);
		}
	}
	if(ids.length==newids.length)
		logger.info('Id: '+id+' not removed because not found');
	ids=newids;
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
var outputresults = function(){
	if(people.length!=ids.length)
		return;
	var ranklen=8;
	var namelen=16;
	var solvedlen=8;
	var messagge='```\n';
	messagge+= reduceto('Ranking',ranklen) + '|'+reduceto('Username',namelen)+ '|' +reduceto('Solved',solvedlen)+ '| Last Submission\n';
	people.sort(function(a, b) {
		if(a.num!=b.num)
		return b.num - a.num;
		return b.lastsubmit > a.lastsubmit;
	});
	for(var i=0;i<people.length;i++){
		messagge+= reduceto('    '+(i+1)+'.',ranklen) + '|'+reduceto(people[i].name,namelen)+ '|' +reduceto(''+people[i].num,solvedlen)+ '| '+ people[i].lastsubmit +'\n';
		//messagge+=((i+1) + '.\t\t|' + people[i].name +  '\t\t|' + people[i].num +'\t|'  + people[i].lastsubmit +'\n');
	}
	messagge+='```';
	logger.info('score sended to: ' + curchannel);
	curchannel.send(messagge);
}
var results = function(){
	logger.info(people);
	people.splice(0,people.length);
	if(ids.length==0){
		curchannel.send('שגיאה! פחות מדי אנשים');
	}
	for(var i=0;i<ids.length;i++){
		request(geturl(ids[i]), { json: true }, (err, res, body) => {
			if (err) { 
				logger.info('err!');
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
			people.push(person);
			logger.info('Id: '+id+'\nName: '+name+'\n'+'Problems solved: '+num + '\n' +'Last submission: '+lastsubmit + '\n');
			outputresults();
		});
	}
}
var quotes=['זה ספר - מין דבר מלבני כזה עם דפים','אני מאמין בחומוס',"אם חם לכם יותר מדי צאו מהמטבח","אבא שלי אמר לי: לעולם לא תהיה גמל, נולדת חמור","אם תשאר אנושות ישאר ioi",
	"תקשיבו אני בבית עם אשתי + 3 טרוריסטים. (חיזב-אלה, חמא-סופי והאביב הערבי וכאמור האימאם שלהם) אתם יודעים מה זה להיות בסגר איתי? אישתי עוד רגע מדביקה את עצמה בקורנה רק בשביל שישימו אותה בבידוד בשקט ועוד לא דיברתי על הארגוני טרור. תעלו. זה חשוב. לחיי הנישואים שלי. לא בא לי להפרד ממנה. יהיה באסה למחוק את הפלאפון שלה מכול הזכרונות ומצד שני היא טוענת שסגר בבית איתי זה עינוי שהסינים לא חשבו עליו.",
	"יש מאמנים שקיבלו את התפקיד כי הם גאונים אני קיבלתי אותו כי אני קרציה. אבל אולימפית!",
	"אין מה לעשות בפ״ת אפילו כשאין קורונה.",
	"היום יושב על תרגיל לרפאל. מחר פוגשת שמה את יוליה! מתכנתת אמבדד! טאק! מתחתן! טאק! אבא לחמישה ילדים! טאק מתגרש! משלם 7000 שקל מזונות בחודש! עובר לגור בתחנה מרכזית. בקופסת קרטון של פריג׳דר!",
	"יווו אתם יותר משועממים מהורה שהשאירו לו 3 ילדים בבית שצופים בלי הפסקה בסרטונים של לאנה מיינהארט",
	"פתאום אני מתחיל לקרוא על מלחמת העולם השנייה וללמוד גבול של פונקציה"];
var randomquote = function(channelID){
	curchannel.send(quotes[Math.floor(Math.random()*quotes.length)]);
}

/*client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('Pong!');
  }
});*/
client.on('message', msg => {//(user, userID, channelID, message, evt) 
	//logger.info(msg);
	var message=msg.content;
	//logger.info(message);
	var user = msg.author;
	//logger.info(user);
	var userID = user.id;
	//logger.info(userID);
	var channel = msg.channel;
	var channelID = msg.channel.id;
	//logger.info(channelID);
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
	if(channelID==673217140181958707 || channelID==692106810123092030){//important
		return;
	}
	if(channelID==673223220630913068 || channelID==692107145700835338){//spoilers
		return;
	}
	
    if (message.substring(0,name.length ) == name) {// a direct call for nezerbot
		curchannel=channel;
        var args = message.substring(name.length).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
        switch(cmd) {
			case 'help':
				var message='';
				var documntation=['ברוך הבא ל NezerNot גרסא 1.0.0','מצורפת רשימה של כל הפקודות החוקיות:',
				'!help '+' קבל את ההודעה הזאת',
				'!ping '+'בדוק האם הבוט הזה חי',
				'!snap [args]'  + ' שנתונים ברשימה CSES' + ' קבל את המצב על משתמשי ',
				'!add [args]' + ' שנתונים ברשימה CSES' +' הוסף לרשימת המעקב משתמשי',
				'!remove [args]' + ' שנתונים ברשימה CSES' +' הורד מרשימת המעקב משתמשי ',
				'!leaderboard + !scoreboard' + ' הדפס את לוח התוצאות',
				'!load' + ' CSESטען מתוך הזכרון המקומי את רשימת משתמשי ה',
				'!unload' + ' CSES שמור לזכרון המקומי את רשימת המעקב על',
				'!randomquote ' +' (disclaimer: הציטוטים בחלקן הצועו מהקשרן)'+' הדפס ציטוט אקראי של נצר '];
				for(var i=0;i<documntation.length;i++){
					message += documntation[i]+'\n';
				}
				channel.send(message);
				break;
            case 'ping':
				channel.send('אני חי כמו תמיד');
				break;
			case 'shutup':
				channel.send('<@' +userID+'> אוקי אבל קודם פתור 100 שאלות');
				break;
			case 'channel':
                channel.send(channelID);
				break
			case 'snap':
				if(args.length==0){
					channel.send('מעניין ביקשת ממני להדפיס את התוכן על אנשים אבל לא אמרת איזה\n'+'אתה יכול לתת רשימה של ids מופרדים ברווח בודד');
					break;
				}
				for(var i=0;i<args.length;i++)
					snapcontent(args[i]);
				break;
			case 'snapall':
				if(ids.length==0){
					channel.send('מעניין ביקשת ממני להדפיס את התוכן על אנשים אבל לא אמרת איזה\n'+'אתה יכול לתת רשימה של ids מופרדים ברווח בודד');
					break;
				}
				for(var i=0;i<ids.length;i++)
					snapcontent(ids[i]);
				break;
			case 'add':
				if(args.length==0){
					channel.send('מעניין ביקשת ממני להוסיף אנשים אבל לא אמרת איזה\n'+'אתה יכול לתת רשימה של ids מופרדים ברווח בודד');
					break;
				}
				for(var i=0;i<args.length;i++)
					addid(args[i]);
				logger.info(ids);
				channel.send('לבקשתך הוספתי '+args.length+' אנשים לרשימת המעקב שלי');
				break;
			case 'remove':
				if(args.length==0){
					channel.send('מעניין ביקשת ממני להוריד אנשים אבל לא אמרת איזה\n'+'אתה יכול לתת רשימה של ids מופרדים ברווח בודד');
					break;
				}
				for(var i=0;i<args.length;i++)
					removeid(args[i]);
				logger.info(ids);
				channel.send(' לבקשתך הורדתי'+args.length+' אנשים לרשימת המעקב שלי');
				break;
			case 'randomquote':
				randomquote(channelID);
				break;
			case 'israndom':
				for(var i=0;!(i==args[0]);i++)
					logger.info(Math.random());
				break;
			case 'leaderboard':
			case 'scoreboard':
				if(Math.random()<0.3){
					var possibleresponses=['כמה זמן אתה רק מסתכל על תוצאות','לא יתווספו לך שאלות נוספות רק מלהסתכל אתה יודע?','אני הרשתי מסתכלת בתוצאות דא?','תפסיק להסתכל על תוצאות ותפתור שאלות'];
					channel.send(possibleresponses[Math.floor(Math.random()*possibleresponses.length)]);
					logger.info('answering call for leaderboard');
				}
				results();
				break;
			case 'load':
				data = require('./data.json');
				ids = data.ids;
				channel.send('תענתי את רשימת המעקב');
				logger.info(ids);
				break;
			case 'unload':
				data.ids=ids;
				var fs = require('fs');
				fs.writeFile('data.json', JSON.stringify(data), 'utf8', function(err) {
						if (err) throw err;
						logger.info('completed unloading');
						channel.send('שמרתי את רשימת המעקב הנוכחית שלי');
				});
				break;
			default :
				channel.send(':לא ממש הבנתי מה אתה מנסה להגיד הפקודות החוקיות הן' + '\n!add !help !scoreboard !randomquote !shutup !wakeup !remove');
         }
     }else{
		 if(user.bot){
			 logger.info('meesage by bot');
			 return;
			 logger.info('what?');
		 }
		 /*var obj=bot.users[userID];
		 logger.info(userID);
		 logger.info(obj);
		 logger.info(message);*/
		 if(message.indexOf(client.user.id)!=-1 || message.indexOf(client.user.username)!=-1){
			logger.info('bot.id: '+message.indexOf(client.user.id));
			logger.info('bot.username: '+message.indexOf(client.user.username));
			//logger.info('end: '+message.indexOf('safasfhfhfbw'));
			var possibleresponses=['מי זה מדבר עלי?', 'מה אתה רוצה ממני?','הי מה אתה חושב שאתה אומר עלי?'];
			channel.send(possibleresponses[Math.floor(Math.random() * possibleresponses.length)] + '\n נסה nezerbot!help לעזרה בשביל להבין עלי יותר');
		 }else if(message == 'cses!leaderboard'){
			 if(Math.random()<0.4){
				var possibleresponses=['כמה זמן אתה רק מסתכל על תוצאות','לא יתווספו לך שאלות נוספות רק מלהסתכל אתה יודע?','אני הרשתי מסתכלת בתוצאות דא?','תפסיק להסתכל על תוצאות ותפתור שאלות'];
				channel.send(possibleresponses[Math.floor(Math.random()*possibleresponses.length)]);
				logger.info('answering call for leaderboard');
			 }
		 }else{
			 if(Math.random()<0.03){
				var possibleresponses=['תפסיק לדבר ותפתור שאלות','אני הרשתי מדברת דא?'];
				channel.send(possibleresponses[Math.floor(Math.random()*possibleresponses.length)]);
				logger.info('answering random message');
			 }
		 }
	 }
});
