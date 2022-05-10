var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mailgun_apikey = process.env.API_KEY;
var mailgun_domain = process.env.DOMAIN;

var mailgun = require('mailgun-js')({apiKey: mailgun_apikey, domain: mailgun_domain});

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


app.listen(5000, function (err) {
    if (!err)
        console.log("Site is live");
    else console.log(err)
});

// for cors
/*var whitelist = [
    'http://localmenu.co'
];*/
var whitelist = [
    'https://api.mailgun.net/v3/*',
    //Add more domains to whitelist
];
var corsOptions = {
    origin: function (origin, callback) {
        var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
        callback(null, originIsWhitelisted);
    },
    credentials: true
};
app.use(cors(corsOptions));

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'https://api.mailgun.net/v3/*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');
    next();
});

const emailController = require('./App/Controllers/EmailController');

function router(app) {
  app.post('/webhooks/*', function (req, res, next) {
    var body = req.body;

    if (!mailgun.validateWebhook(body.timestamp, body.token, body.signature)) {
      console.error('Request came, but not from Mailgun');
      res.send({ error: { message: 'Invalid signature. Are you even Mailgun?' } });
      return;
    }

    next();
  });

    app.post('/webhooks/create-email', (req, res) => {
        emailController.createEmail(req.body, (resp) => {
            res.send(resp)
        })
    })
}

app.listen(5000, function(){
  router(app);
  console.log("listening post in port 5000");
});