var request = require('request');

var base_url = 'https://api.crex24.com/CryptoExchangeService/BotPublic/ReturnTicker';

function get_summary(coin, exchange, cb) {
  var req_url = base_url + '?request=[NamePairs=' + exchange + '_' + coin + ']';
  request({uri: req_url, json: true}, function (error, response, body) {
	console.log(req_url);
    if (error) {
      return cb(error, null);
    } else {
      if (body.message) {
        return cb(body.message, null)
      } else {
        body.result[0]['last'] = body.result[0]['Last'];
        return cb (null, body.result[0]);
      }
    }
  });
}


module.exports = {
  get_data: function(coin, exchange, cb) {
 console.log('tete');
    var error = null;
        get_summary(coin, exchange, function(err, stats) {
          if (err) { error = err; }
          return cb(error, {buys: buys, sells: sells, chartdata: [], trades: trades, stats: stats});
        });
  }
};
