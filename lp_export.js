var request = require('request');
var nodemailer = require('nodemailer');

var d = new Date();
var epochNow = d.getTime();
var epochMonthAgo = d.setMonth(d.getMonth()-1);

var oauth = {
        consumer_key: '',
        consumer_secret: '',
        token: '',
        token_secret: ''
    },
    url = 'https://lo.enghist.liveperson.net/interaction_history/api/account/25706656/interactions/search?limit=100&offset=0',
qs = {
    "start": {
        "from": epochMonthAgo,
        "to": epochNow
    }
};

function HttpRequest() {
	console.log(url);
	request.post({
		url: url,
		oauth: oauth,
		body: qs,
		json: true,
		headers: {
			'Content-Type': 'application/json'
		}}, function (e, r, b) {
			//console.log(b); uncomment for checking API response
			GetNextUrl(SendMail(b));
		}
	);
}

function SendMail(result) {
	if(result._metadata.hasOwnProperty('next')) {
		var next = result._metadata.next.href;
	} else {
		var next = undefined;
	}
	
	var transporter = nodemailer.createTransport({
	service: 'gmail',
		auth: {
			user: '',
			pass: ''
		}
	});
	var mailOptions = {
		from: '',
		to: '',
		subject: 'LivePerson Transcript Export',
		text: JSON.stringify(result)
	};
	
	transporter.sendMail(mailOptions, function(error, info){
		if (error) {
			console.log(error);
		} else {
			console.log('Email sent: ' + info.response);
		}
	});
	
	return next;
}

function GetNextUrl(next) {
	if(next) {
		url = next;
		HttpRequest();
	}
}

HttpRequest();