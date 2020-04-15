var Discord = require('discord.js');
var logger = require('winston');
var auth = require('./auth.json');
var data = require('./data.json');
var request = require('request');
var cses = require("./cses.js");
var codeforces = require("./codeforces.js");
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
	cses.setpeople(data.people);
});
var ans;
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
var curchannel;
var snapcontent = function(id){
	logger.info(geturl(id));
	request(geturl(id), { json: true }, (err, res, body) => {
		if (err) { 
			logger.info('err!');
			return;
		}
		ans= body;
		var name=substrtream(ans,'<title>CSES - User ','</title>');
		var num=substrtream(ans,'<tr><td >CSES Problem Set</td><td ><a href="/problemset/user/'+id +'/">','</a></td></tr>');
		num=Number(num);
		var lastsubmit=substrtream(ans,'<tr><td >Last submission</td><td >','</td></tr>');
		curchannel.send('Id: '+id+'\nName: '+name+'\n'+'Problems solved: '+num + '\n' +'Last submission: '+lastsubmit + '\n');
	});
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
var quotes=['זה ספר - מין דבר מלבני כזה עם דפים','אני מאמין בחומוס',"אם חם לכם יותר מדי צאו מהמטבח","אבא שלי אמר לי: לעולם לא תהיה גמל, נולדת חמור","אם תשאר אנושות ישאר ioi",
	"תקשיבו אני בבית עם אשתי + 3 טרוריסטים. (חיזב-אלה, חמא-סופי והאביב הערבי וכאמור האימאם שלהם) אתם יודעים מה זה להיות בסגר איתי? אישתי עוד רגע מדביקה את עצמה בקורנה רק בשביל שישימו אותה בבידוד בשקט ועוד לא דיברתי על הארגוני טרור. תעלו. זה חשוב. לחיי הנישואים שלי. לא בא לי להפרד ממנה. יהיה באסה למחוק את הפלאפון שלה מכול הזכרונות ומצד שני היא טוענת שסגר בבית איתי זה עינוי שהסינים לא חשבו עליו.",
	"יש מאמנים שקיבלו את התפקיד כי הם גאונים אני קיבלתי אותו כי אני קרציה. אבל אולימפית!",
	"אין מה לעשות בפ״ת אפילו כשאין קורונה.",
	"היום יושב על תרגיל לרפאל. מחר פוגשת שמה את יוליה! מתכנתת אמבדד! טאק! מתחתן! טאק! אבא לחמישה ילדים! טאק מתגרש! משלם 7000 שקל מזונות בחודש! עובר לגור בתחנה מרכזית. בקופסת קרטון של פריג׳דר!",
	"יווו אתם יותר משועממים מהורה שהשאירו לו 3 ילדים בבית שצופים בלי הפסקה בסרטונים של לאנה מיינהארט",
	"פתאום אני מתחיל לקרוא על מלחמת העולם השנייה וללמוד גבול של פונקציה",
	"אגב יש לי כל מיני אויבים. נניח נסראללה זה רמה אחת. ביבי זה רמה 13 אבל לאנה מיינהארט היא הבוס הגדול. מספיק שאני אשמע את הקול שלה כדי שימותו לי 70 תאי מוח",
	"אתם פשוט לא מעכלים מה זה לישמוע את הקול ציפציף של לאנה מיינהארט מסבירה איך להכין סליים ורוד אבל מסריח ודביק עם נצנצים",
	"לא יודע מי זה דויד  צילג אבל אני מחנך את הילדים שאם הם לא בטוחים שיעשו ההפך ממה שהמורה אומרת\n"+
	"כלומר אם המורה אומרת לא לשחק בכביש אז בפוקס יצא לה נכון\n"+
	"אבל אם אומרים לבנות שלי שמחשבים זה לבנים (סיפור אמיתי) שיעשו מה שבה להם\n"+
	"אם זה יכול להיות מטר או משהו\n"+
	"היה כבר דיון ארוך (ניסו ללמד אותם סדר גודל) אז שאלו את הילדה מה יהיה עובי של 10 ספרים.\n"+
	"בקיצור אלה מצאה באינטרנט מה הספר הכי עבה בעולם - יכול להיות 10 מטר\n"+
	"אז פסלו לה את העבודה. היו מריבות עם המורה מפה עד להודעה חדשה.",
	"אין לך מושג כמה זה נורא. אם אני צריך לבחור צעדת מוות מאושוויץ או לשמוע את לאנה מיינהארט אני נועל נעלי הליכה נשבע לך",
	"איך אתם חושבים שהגעתי לאמן אתכם? השתתפתי בשעשעון. והפסדתי."];
var randomquote = function(channelID){
	curchannel.send(quotes[Math.floor(Math.random()*quotes.length)]);
}
var allquote = function(channelID){
	for(var i=0;i<quotes.length;i++)
		curchannel.send(quotes[i]);
}

var resultschannel;
var interval=-1;
var intervalresults = function(){
	outchannel=resultschannel;
	cses.difresults(resultschannel,ids);
}
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
				var documntation=['ברוך הבא ל NezerBot גרסא1.1.0','מצורפת רשימה של כל הפקודות החוקיות:',
				'!help '+' קבל את ההודעה הזאת',
				'!ping '+'בדוק האם הבוט הזה חי',
				'!snap [ids]'  + ' שנתונים ברשימה CSES' + ' קבל את המצב על משתמשי ',
				'!add [ids]' + ' שנתונים ברשימה CSES' +' הוסף לרשימת המעקב משתמשי',
				'!remove [ids]' + ' שנתונים ברשימה CSES' +' הורד מרשימת המעקב משתמשי ',
				'!leaderboard + !scoreboard' + ' הדפס את לוח התוצאות',
				'!difleaderboard + !difscoreboard' + ' הדפס את שינויי לוח התוצאות',
				'!load' + ' CSESטען מתוך הזכרון המקומי את רשימת משתמשי ה',
				'!unload' + ' CSES שמור לזכרון המקומי את רשימת המעקב על',
				'!randomquote ' +' (disclaimer: הציטוטים בחלקן הוצאו מהקשרם)'+' הדפס ציטוט אקראי של נצר ',
				'!allquote ' +' (disclaimer: הציטוטים בחלקן הוצאו מהקשרם)'+' הדפס את כל ציטטוי נצר ',
				'!addtimer minutes' +' הדפס כל כמות כזאת של דקות את התוצאות לערוץ הזה ',
				'!removetimer' +' מוריד את הטיימר הקבוע של התוצאות ',
				'!shutup' +' אמור להשתיק אותו כן בטח ',
				'!randomquestion [args]' +' בתוך הארגומנטים של הפקודה help קבל שאלה אקראית לתמיכה נוספת נסה  ',
				'!getalltags [number]' +' קבל את רשימת התאגים שיש מהם לפחות כמות כזאת של שאלות '];
				for(var i=0;i<documntation.length;i++){
					message += documntation[i]+'\n';
				}
				channel.send(message);
				break;
			case 'addtimer':
				if(args.length==0 || !(Number(args[0])>= 1)||  !(Number(args[0])<= 24*60*7)){
					channel.send('הכנס מספר חוקי של דקות!');
					return;
				}
				resultschannel=curchannel;
				if(interval!=-1){
					clearInterval(interval);
				}
				interval=setInterval(intervalresults,60000*(Number(args[0])));
				channel.send('טיימר הופעל');
				logger.info('added interval');
				break;
            case 'ping':
				channel.send('אני חי כמו תמיד');
				break;
			case 'shutup':
				channel.send('<@' +userID+'> אוקי אבל קודם פתור 100 שאלות');
			case 'removetimer':
				if(interval!=-1){
					clearInterval(interval);
					logger.info('removed interval');
				}else{
					channel.send('לא נמצא טיימר!');
				}
				break;
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
			case 'echo':
				//var chanID= args[0];
				channel= client.channels.cache.get(args[0]);
				logger.info(channel);
				var message = '';
				for(var i=1;i<args.length;i++){
					message += args[i]+' ';
				}
				channel.send(message);
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
			case 'allquote':
				allquote(channelID);
				break;
			case 'leaderboard':
			case 'scoreboard':
				//outchannel=curchannel;
				logger.info(cses);
				if(Math.random()<0.3){
					var possibleresponses=['כמה זמן אתה רק מסתכל על תוצאות','לא יתווספו לך שאלות נוספות רק מלהסתכל אתה יודע?','אני הרשתי מסתכלת בתוצאות דא?','תפסיק להסתכל על תוצאות ותפתור שאלות'];
					channel.send('<@' +userID+'> '+possibleresponses[Math.floor(Math.random()*possibleresponses.length)]);
					logger.info('answering call for leaderboard');
				}
				cses.results(curchannel,ids);
				
				break;
			case 'difleaderboard':
			case 'difscoreboard':
				if(Math.random()<0.3){
					var possibleresponses=['כמה זמן אתה רק מסתכל על תוצאות','לא יתווספו לך שאלות נוספות רק מלהסתכל אתה יודע?','אני הרשתי מסתכלת בתוצאות דא?','תפסיק להסתכל על תוצאות ותפתור שאלות'];
					channel.send('<@' +userID+'> '+possibleresponses[Math.floor(Math.random()*possibleresponses.length)]);
					logger.info('answering call for leaderboard');
				}
				cses.difresults(curchannel,ids);
				break;
			case 'load':
				data = require('./data.json');
				ids = data.ids;
				channel.send('טענתי את רשימת המעקב');
				logger.info(ids);
				break;
			case 'unload':
				data.ids=ids;
				data.people=cses.getpeople();
				var fs = require('fs');
				fs.writeFile('data.json', JSON.stringify(data), 'utf8', function(err) {
						if (err) throw err;
						logger.info('completed unloading');
						channel.send('שמרתי את רשימת המעקב הנוכחית שלי');
				});
				break;
			case 'getalltags':
				var num=1;
				if(args.length>0){
					num=Number(args[0]);
				}
				codeforces.getAllTags(curchannel,num);
				break;
			case 'randomquestion':
				codeforces.getGetRandomquestion(curchannel,args);
				break;
			default :
				channel.send(':לא ממש הבנתי מה אתה מנסה להגיד הפקודות החוקיות הן' + '\n!add !help !difleaderboard !scoreboard !randomquote !shutup !wakeup !remove');
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
				channel.send('<@' +userID+'> '+possibleresponses[Math.floor(Math.random()*possibleresponses.length)]);
				logger.info('<@' +userID+'>'+'answering call for leaderboard');
			 }
		 }else{
			 if(Math.random()<0.04){
				var possibleresponses=['תפסיק לדבר ותפתור שאלות','אני הרשתי מדברת דא?','כולך דיבורים איפה שאלות?','שתוק'];
				channel.send('<@' +userID+'> '+possibleresponses[Math.floor(Math.random()*possibleresponses.length)]);
				logger.info('answering random message');
			 }
		 }
	 }
});
