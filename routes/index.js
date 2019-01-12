var express = require('express')
  , router = express.Router()
  , settings = require('../lib/settings')
  , locale = require('../lib/locale')
  , db = require('../lib/database')
  , lib = require('../lib/explorer')
  , qr = require('qr-image')
  , fs = require('fs');

const dns = require('dns')

function route_get_block(res, blockhash) {
  lib.get_block(blockhash, function (block) {
    if (block != 'There was an error. Check your console.') {
      if (blockhash == settings.genesis_block) {
        res.render('block', { active: 'block', block: block, confirmations: settings.confirmations, txs: 'GENESIS'});
      } else {
        db.get_txs(block, function(txs) {
          if (txs.length > 0) {
            res.render('block', { active: 'block', block: block, confirmations: settings.confirmations, txs: txs});
          } else {
            db.create_txs(block, function(){
              db.get_txs(block, function(ntxs) {
                if (ntxs.length > 0) {
                  res.render('block', { active: 'block', block: block, confirmations: settings.confirmations, txs: ntxs});
                } else {
                  route_get_index(res, 'Block not found: ' + blockhash);
                }
              });
            });
          }
        });
      }
    } else {
      route_get_index(res, 'Block not found: ' + blockhash);
    }
  });
}
/* GET functions */

function route_get_tx(res, txid) {
  if (txid == settings.genesis_tx) {
    route_get_block(res, settings.genesis_block);
  } else {
    db.get_tx(txid, function(tx) {
      if (tx) {
        lib.get_blockcount(function(blockcount) {
          res.render('tx', { active: 'tx', tx: tx, confirmations: settings.confirmations, blockcount: blockcount});
        });
      }
      else {
        lib.get_rawtransaction(txid, function(rtx) {
          if (rtx.txid) {
            lib.prepare_vin(rtx, function(vin) {
              lib.prepare_vout(rtx.vout, rtx.txid, vin, function(rvout, rvin) {
                lib.calculate_total(rvout, function(total){
                  if (!rtx.confirmations > 0) {
                    var utx = {
                      txid: rtx.txid,
                      vin: rvin,
                      vout: rvout,
                      total: total.toFixed(8),
                      timestamp: rtx.time,
                      blockhash: '-',
                      blockindex: -1,
                    };
                    res.render('tx', { active: 'tx', tx: utx, confirmations: settings.confirmations, blockcount:-1});
                  } else {
                    var utx = {
                      txid: rtx.txid,
                      vin: rvin,
                      vout: rvout,
                      total: total.toFixed(8),
                      timestamp: rtx.time,
                      blockhash: rtx.blockhash,
                      blockindex: rtx.blockheight,
                    };
                    lib.get_blockcount(function(blockcount) {
                      res.render('tx', { active: 'tx', tx: utx, confirmations: settings.confirmations, blockcount: blockcount});
                    });
                  }
                });
              });
            });
          } else {
            route_get_index(res, null);
          }
        });
      }
    });
  }
}

function route_get_index(res, error) {
  res.render('index', { active: 'home', error: error, warning: null});
}

function route_get_address(res, hash, count) {
  db.get_address(hash, function(address) {
    if (address) {
      var txs = [];
      var hashes = address.txs.reverse();
      if (address.txs.length < count) {
        count = address.txs.length;
      }
      lib.syncLoop(count, function (loop) {
        var i = loop.iteration();
        db.get_tx(hashes[i].addresses, function(tx) {
          if (tx) {
            txs.push(tx);
            loop.next();
          } else {
            loop.next();
          }
        });
      }, function(){

        res.render('address', { active: 'address', address: address, txs: txs});
      });

    } else {
      route_get_index(res, hash + ' not found');
    }
  });
}

/* GET home page. */
router.get('/', function(req, res) {
  route_get_index(res, null);
});

router.get('/info', function(req, res) {
  res.render('info', { active: 'info', address: settings.address, hashes: settings.api });
});

router.get('/markets/:market', function(req, res) {
  var market = req.params['market'];
  if (settings.markets.enabled.indexOf(market) != -1) {
    db.get_market(market, function(data) {
      /*if (market === 'bittrex') {
        data = JSON.parse(data);
      }*/
      console.log(data);
      res.render('./markets/' + market, {
        active: 'markets',
        marketdata: {
          coin: settings.markets.coin,
          exchange: settings.markets.exchange,
          data: data,
        },
        market: market
      });
    });
  } else {
    route_get_index(res, null);
  }
});

router.get('/richlist', function(req, res) {
  if (settings.display.richlist == true ) {
    db.get_stats(settings.coin, function (stats) {
      db.get_richlist(settings.coin, function(richlist){
        //console.log(richlist);
        if (richlist) {
          db.get_distribution(richlist, stats, function(distribution) {
            //console.log(distribution);
            res.render('richlist', {
              active: 'richlist',
              balance: richlist.balance,
              received: richlist.received,
              stats: stats,
              dista: distribution.t_1_25,
              distb: distribution.t_26_50,
              distc: distribution.t_51_75,
              distd: distribution.t_76_100,
              diste: distribution.t_101plus,
              show_dist: settings.richlist.distribution,
              show_received: settings.richlist.received,
              show_balance: settings.richlist.balance,
            });
          });
        } else {
          route_get_index(res, null);
        }
      });
    });
  } else {
    route_get_index(res, null);
  }
});

router.get('/movement', function(req, res) {
  res.render('movement', {active: 'movement', flaga: settings.movement.low_flag, flagb: settings.movement.high_flag, min_amount:settings.movement.min_amount});
});

router.get('/network', function(req, res) {
  res.render('network', {active: 'network'});
});

router.get('/masternodes', function(req, res) {
  res.render('masternodes', {active: 'masternodes'});
});

router.get('/storade', function(req, res) {
  res.render('storade', {active: 'storade'});
});

router.get('/ext/masternodeslistfull', function(req, res) {
  lib.get_masternodelist(function(list) {

    var mnList = [];

    for (var key in list) {

      if (list.hasOwnProperty(key)) {
        var mnData = list[key]
        var txhash = mnData['txhash']
        var mnItem = {
          address: "",
          status: "",
          lastseen: "",
          lastpaid: null,
	        activetime: "",
          network: "",
          ip: ""
        };

        // Address
        if (settings.masternodes.list_format.address === 0)
          mnItem.address = txhash;
        else if (settings.masternodes.list_format.address > -1)
          mnItem.address = mnData['addr'];

        // Status
        if (settings.masternodes.list_format.status > -1)
          mnItem.status = mnData['status'];

        // last seen
        if (settings.masternodes.list_format.lastseen > -1)
          mnItem.lastseen = mnData['lastseen'];

        // last paid
        if (settings.masternodes.list_format.lastpaid > -1)
          mnItem.lastpaid = mnData['lastpaid'];

        // active time
        if (settings.masternodes.list_format.activetime > -1)
          mnItem.activetime = mnData['activetime'];

        // network
        if (settings.masternodes.list_format.network > -1)
          mnItem.network = mnData['network'];

        // IP
        if (settings.masternodes.list_format.ip === 0)
          mnItem.ip = txhash.trim().replace(':'+settings.masternodes.default_port, '');
        else if (settings.masternodes.list_format.ip > -1)
          mnItem.ip = mnData['ip'].trim().replace(':'+settings.masternodes.default_port, '');

        mnList.push(mnItem);
      }
    }

    res.send({ data: mnList });
  });
});

router.get('/reward', function(req, res){
  //db.get_stats(settings.coin, function (stats) {
    console.log(stats);
    db.get_heavy(settings.coin, function (heavy) {
      //heavy = heavy;
      var votes = heavy.votes;
      votes.sort(function (a,b) {
        if (a.count < b.count) {
          return -1;
        } else if (a.count > b.count) {
          return 1;
        } else {
         return 0;
        }
      });

      res.render('reward', { active: 'reward', stats: stats, heavy: heavy, votes: heavy.votes });
    });
  //});
});

router.get('/tx/:txid', function(req, res) {
  route_get_tx(res, req.param('txid'));
});

router.get('/block/:hash', function(req, res) {
  route_get_block(res, req.param('hash'));
});

router.get('/address/:hash', function(req, res) {
  route_get_address(res, req.param('hash'), settings.txcount);
});

router.get('/address/:hash/:count', function(req, res) {
  route_get_address(res, req.param('hash'), req.param('count'));
});

router.post('/search', function(req, res) {
  var query = req.body.search;
  if (query.length == 64) {
    if (query == settings.genesis_tx) {
      res.redirect('/block/' + settings.genesis_block);
    } else {
      db.get_tx(query, function(tx) {
        if (tx) {
          res.redirect('/tx/' +tx.txid);
        } else {
          lib.get_block(query, function(block) {
            if (block != 'There was an error. Check your console.') {
              res.redirect('/block/' + query);
            } else {
              route_get_index(res, locale.ex_search_error + query );
            }
          });
        }
      });
    }
  } else {
    db.get_address(query, function(address) {
      if (address) {
        res.redirect('/address/' + address.a_id);
      } else {
        lib.get_blockhash(query, function(hash) {
          if (hash != 'There was an error. Check your console.') {
            res.redirect('/block/' + hash);
          } else {
            route_get_index(res, locale.ex_search_error + query );
          }
        });
      }
    });
  }
});

router.get('/ext/storade_stats', function(req, res) {
  lib.get_storadelist(function(list) {

    var strdList = [];

    if(typeof list !== 'object' || "0" in list === false || "ip" in list[0] === false) {
        res.send({ data: strdList });
        return
    }

    for (var key in list) {

      if (list.hasOwnProperty(key)) {
        var strdData = list[key]
        var strdItem = {
          ip: "",
          status: "",
          lastseen: "",
          os: "",
          python: "",
          free_storage: ""
        };

        // IP
        if ("ip" in strdData && settings.storade.list_format.ip > -1)
          strdItem.ip = strdData['ip'];

        // Status
        if ("error" in strdData && settings.storade.list_format.status > -1)
          strdItem.status = strdData['error'];

        // last seen
        if ("date" in strdData && settings.storade.list_format.lastseen > -1)
          strdItem.lastseen = strdData['date'];

        // os
        if ("os" in strdData && settings.storade.list_format.os > -1)
          strdItem.os = strdData['os'];

        // python
        if ("python" in strdData && settings.storade.list_format.python > -1)
          strdItem.python = strdData['python'];

        // free_storage
        if ("free_storage" in strdData && settings.storade.list_format.free_storage > -1)
          strdItem.free_storage = strdData['free_storage'];

        strdList.push(strdItem);
      }
    }

    res.send({ data: strdList });
  });
});

router.post('/ext/storade_stats', function(req, res) {

  var error_result = '{}';
  var success_result = 'success';
  var storade_stats_domain = 'storadestats.adeptio.cc'
  var json_file = 'public/jsondata/storade_list.json'

  if("X-Real-IP" in req.headers) 
    var ip = req.headers["X-Real-IP"]
  else
    var ip = req.connection.remoteAddress

  lib.check_IP(ip, function(client_ip){

    if(!client_ip) {
      res.send(error_result);
      return
    }

    dns.lookup(storade_stats_domain, function(err, result) {
      lib.check_IP(result, function(storade_stats_ip){

        if(!storade_stats_ip || client_ip != storade_stats_ip) {
          res.send(error_result);
          return
        }

        data = req.body

        if("0" in data && "ip" in data[0]) {

          fs.writeFile(json_file, JSON.stringify(data), 'utf8', (error) => {});

          res.send(success_result);
        } else {
          res.send(error_result);
        }
      })
    });
  });
});

router.get('/qr/:string', function(req, res) {
  if (req.param('string')) {
    var address = qr.image(req.param('string'), {
      type: 'png',
      size: 4,
      margin: 1,
      ec_level: 'M'
    });
    res.type('png');
    address.pipe(res);
  }
});

router.get('/ext/summary', function(req, res) {
  lib.get_difficulty(function(difficulty) {
    difficultyHybrid = ''
    if (difficulty['proof-of-work']) {
            if (settings.index.difficulty == 'Hybrid') {
              difficultyHybrid = 'POS: ' + difficulty['proof-of-stake'];
              difficulty = 'POW: ' + difficulty['proof-of-work'];
            } else if (settings.index.difficulty == 'POW') {
              difficulty = difficulty['proof-of-work'];
            } else {
        difficulty = difficulty['proof-of-stake'];
      }
    }
    lib.get_hashrate(function(hashrate) {
      lib.get_connectioncount(function(connections){
        lib.get_masternodecount(function(masternodestotal){
          lib.get_masternodecountonline(function(masternodesonline){
            lib.get_blockcount(function(blockcount) {
              db.get_stats(settings.coin, function (stats) {
                if (hashrate == 'There was an error. Check your console.') {
                  hashrate = 0;
                }
                var masternodesoffline = Math.floor(masternodestotal - masternodesonline);
                res.send({ data: [{
                  difficulty: difficulty,
                  difficultyHybrid: difficultyHybrid,
                  supply: stats.supply,
                  hashrate: hashrate,
                  lastPrice: stats.last_price,
                  connections: connections,
                  masternodeCountOnline: masternodesonline,
                  masternodeCountOffline: masternodesoffline,
                  blockcount: blockcount
                }]});
              });
            });
          });
        });
      });
    });
  });
});
module.exports = router;
