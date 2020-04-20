const cheerio = require('cheerio');
const request = require('request');
const notifier = require('node-notifier');
var separateReqPool = {maxSockets: 15};
var async = require('async');
var tweets={},apiurls=[],N=[];


///////////////////////////  CONFIGURE TWITTER HANDLERS /////////////////////////////////////////////////////
var THandlers=[
    {
        name:'StocksToTrade',
        url:"https://twitter.com/StocksToTrade",
        keywords:"break, runner, bounce, continuation,fall,long,hold,watch,sell,down,up,stocks,options,bad,good",
    },
    {
        name:'stockstobuy',
        url:"https://twitter.com/stockstobuy",
        keywords:"break, runner, bounce, continuation,fall,long,hold,watch,sell,down,up,stocks,options,bad,good",
    },
    {
        name:'BuyStocksLow',
        url:"https://twitter.com/BuyStocksLow",
        keywords:"break, runner, bounce, continuation,fall,long,hold,watch,sell,down,up,stocks,options,bad,good",
    },
    {
        name:'AaronKlein10X',
        url:"https://twitter.com/AaronKlein10X",
        keywords:"break, runner, bounce, continuation,fall,long,hold,watch,sell,down,up,stocks,options,bad,good",
    },
    {
        name:'anandchokshi19',
        url:"https://twitter.com/anandchokshi19",
        keywords:"break, runner, bounce, continuation,fall,long,hold,watch,sell,down,up,stocks,options,bad,good",
    },
    {
        name:'elliotjaystocks',
        url:"https://twitter.com/elliotjaystocks",
        keywords:"break, runner, bounce, continuation,fall,long,hold,watch,sell,down,up,stocks,options,bad,good",
    },
    {
        name:'NBCNewsBusiness',
        url:"https://twitter.com/NBCNewsBusiness",
        keywords:"break, runner, bounce, continuation,fall,long,hold,watch,sell,down,up,stocks,options,bad,good",
    },
    {
        name:'rachels_44',
        url:"https://twitter.com/rachels_44",
        keywords:"break, runner, bounce, continuation,fall,long,hold,watch,sell,down,up,stocks,options,bad,good",
    },
    {
        name:'EliteOptions2',
        url:"https://twitter.com/EliteOptions2",
        keywords:"break, runner, bounce, continuation,fall,long,hold,watch,sell,down,up,stocks,options,bad,good",
    },
    {
        name:'cnnbrk',
        url:"https://twitter.com/cnnbrk",
        keywords:"break, runner, bounce, continuation,fall,long,hold,watch,sell,down,up,stocks,options,bad,good",
    },
    {
        name:'ABC',
        url:"https://twitter.com/ABC",
        keywords:"break, runner, bounce, continuation,fall,long,hold,watch,sell,down,up,stocks,options,bad,good",
    },
    {
        name:'CBCAlerts',
        url:"https://twitter.com/CBCAlerts",
        keywords:"break, runner, bounce, continuation,fall,long,hold,watch,sell,down,up,stocks,options,bad,good",
    },
    {
        name:'BBCBreaking',
        url:"https://twitter.com/BBCBreaking",
        keywords:"break, runner, bounce, continuation,fall,long,hold,watch,sell,down,up,stocks,options,bad,good",
    },
    {
        name:'FoxNews',
        url:"https://twitter.com/FoxNews",
        keywords:"break, runner, bounce, continuation,fall,long,hold,watch,sell,down,up,stocks,options,bad,good",
    },
    {
        name:'WSJmarkets',
        url:"https://twitter.com/WSJmarkets",
        keywords:"break, runner, bounce, continuation,fall,long,hold,watch,sell,down,up,stocks,options,bad,good",
    },
    {
        name:'elliotjaystocks',
        url:"https://twitter.com/elliotjaystocks",
        keywords:"break, runner, bounce, continuation,fall,long,hold,watch,sell,down,up,stocks,options,bad,good",
    },
    {
        name:'NBCNewsBusiness',
        url:"https://twitter.com/NBCNewsBusiness",
        keywords:"break, runner, bounce, continuation,fall,long,hold,watch,sell,down,up,stocks,options,bad,good",
    },
    {
        name:'rachels_44',
        url:"https://twitter.com/rachels_44",
        keywords:"break, runner, bounce, continuation,fall,long,hold,watch,sell,down,up,stocks,options,bad,good",
    },
    {
        name:'EliteOptions2',
        url:"https://twitter.com/EliteOptions2",
        keywords:"break, runner, bounce, continuation,fall,long,hold,watch,sell,down,up,stocks,options,bad,good",
    },
    
];
/////////////////////////////////////////////////////////////////////////////////////////////////////////////





//ADD TWEETS
THandlers.forEach((th,i) => {
    tweets[th.url] = [];
    apiurls.push(th.url);
});


//MONITOR
setInterval(() => {
    async.map(apiurls, function(item, callback){
        request({url: item, pool: separateReqPool}, function (error, response, body) {
            try {
                const $ = cheerio.load(body);
                var turl = "https://twitter.com" + response.req.path;
                if(!tweets[turl].length){
                    //FIRST LOAD
                    for(let i=0;i<$('div.js-tweet-text-container p').length;i++){
                        tweets[turl].push($('div.js-tweet-text-container p').eq(i).text());
                    }
                }
                else{
                    //EVERY OTHER TIME
                    for(let i=0;i<$('div.js-tweet-text-container p').length;i++){
                        const s_tweet = $('div.js-tweet-text-container p').eq(i).text();
                        //CHECK IF TWEET IS NEWS
                        if(tweets[turl].indexOf(s_tweet) === -1){
                            tweets[turl].push(s_tweet);
                            let th_kw = THandlers.filter((d,i) => d.url === turl)[0].keywords.split(',');
                            let th_name = THandlers.filter((d,i) => d.url === turl)[0].name;
                            th_kw.forEach((kw,j) => {
                                if(kw === '*'){
                                    N.push({
                                        tweet:s_tweet,
                                        name:th_name
                                    });
                                }
                                else{
                                   if(s_tweet.indexOf(kw) != -1){
                                        N.push({
                                            tweet:s_tweet,
                                            name:th_name
                                        });
                                    }
                                }
                            });
                        }
                    }
                }           
                 
            } catch (e) {
                  console.log('Error =>' + e);
            }
        });
    }, function(err, results){
            console.log(results);
    });
},5*1000);//RUNS EVERY 5 SECONDS

setInterval(() => {
    if(N.length){
        let n = N.shift();
        notifier.notify({title: n.name,message: n.tweet,sound: true},
            console.log({title: n.name,message: n.tweet,sound: true}),
          function(err, response) {
            // Response is response from notification
          }
        );
    }
},500);

