/**
* The Settings Module reads the settings out of settings.json and provides
* this information to the other modules
*/

var fs = require("fs");
var jsonminify = require("jsonminify");


//The app title, visible e.g. in the browser window
exports.title = "Adeptio eXplorer";

//The url it will be accessed from
exports.address = "explorer.adeptio.cc";

// logo
exports.logo = "/images/logo.png";


//The app favicon fully specified url, visible e.g. in the browser window
exports.favicon = "favicon.ico";

//Theme
exports.theme = "Slate";

//The Port ep-lite should listen to
exports.port = process.env.PORT || 3001;


//coin symbol, visible e.g. MAX, LTC, HVC
exports.symbol = "ADE";


//coin name, visible e.g. in the browser window
exports.coin = "adeptio";


//This setting is passed to MongoDB to set up the database
exports.dbsettings = {
  "user": "ciquidus",
  "password": "3xp!0reR",
  "database": "blockchaindb",
  "address" : "localhost",
  "port" : 27017
};


//This setting is passed to the wallet
exports.wallet = { "host" : "127.0.0.1",
  "port" : 11995,
  "user" : "chaincoinrpc",
  "pass" : "password"
};


//Locale file
exports.locale = "locale/en.json",


//Menu items to display
exports.display = {
  "api": true,
  "market": true,
  "twitter": true,
  "facebook": false,
  "googleplus": false,
  "bitcointalk": false,
  "website": false,
  "slack": false,
  "github": false,
  "search": true,
  "richlist": true,
  "masternodes": true,
  "storade": true,
  "movement": true,
  "network": true
};
 
exports.masternodes = {
  "default_port": 0,
  "list_format": {
    "address": 3,
    "status": 1,
    "lastseen": 5,
    "activetime": 6,
    "lastpaid": 7,
    "network": 8,
    "ip": 9
  }
};

exports.storade = {
  "default_port": 0,
  "list_format": {
      "ip": 1,
      "status": 2,
      "lastseen": 3,
      "os": 4,
      "python": 5,
      "free_storage": 6
  }
};

//API view
exports.api = {
  "blockindex": 1337,
  "blockhash": "9ec0d848258b07003361a4bb58bc52ccc8106fb4961f87cc818f5f95fff986b4",
  "txhash": "9ec0d848258b07003361a4bb58bc52ccc8106fb4961f87cc818f5f95fff986b4",
  "address": "AdQmVtCnskXqwRuvTHGyu8DgnWDVbfsC7D",
};

// markets
exports.markets = {
  "coin": "ADE",
  "exchange": "BTC",
  "enabled": ['crex24'],
  "cryptopia_id": "2186",
  "default": "crex24"
};

// richlist/top100 settings
exports.richlist = {
  "distribution": true,
  "received": true,
  "balance": true
};

exports.movement = {
  "min_amount": 100,
  "low_flag": 1000,
  "high_flag": 10000
},

//index
exports.index = {
  "show_hashrate": false,
  "difficulty": "POW",
  "last_txs": 100
};

// twitter
exports.twitter = "adeptio";
exports.facebook = "yourfacebookpage";
exports.googleplus = "yourgooglepluspage";
exports.bitcointalk = "yourbitcointalktopicvalue";
exports.website = "yourcompletewebsiteurlincludingtheprotocol";
exports.slack = "yourcompleteslackinviteurlincludingtheprotocol";
exports.github = "yourgithubaccount/repo";

exports.confirmations = 6;

//timeouts
exports.update_timeout = 125;
exports.check_timeout = 250;


//genesis
exports.genesis_tx = "fa6ef9872494fa9662cf0fecf8c0135a6932e76d7a8764e1155207f3205c7c88";
exports.genesis_block = "00000f639db5734b2b861ef8dbccc33aebd7de44d13de000a12d093bcc866c64";

exports.heavy = false;
exports.txcount = 100;
exports.show_sent_received = true;
exports.supply = "TXOUTSET";
exports.nethash = "getnetworkhashps";
exports.nethash_units = "G";

exports.labels = {};

exports.reloadSettings = function reloadSettings() {
  // Discover where the settings file lives
  var settingsFilename = "settings.json";
  settingsFilename = "./" + settingsFilename;

  var settingsStr;
  try{
    //read the settings sync
    settingsStr = fs.readFileSync(settingsFilename).toString();
  } catch(e){
    console.warn('No settings file found. Continuing using defaults!');
  }

  // try to parse the settings
  var settings;
  try {
    if(settingsStr) {
      settingsStr = jsonminify(settingsStr).replace(",]","]").replace(",}","}");
      settings = JSON.parse(settingsStr);
    }
  }catch(e){
    console.error('There was an error processing your settings.json file: '+e.message);
    process.exit(1);
  }

  //loop trough the settings
  for(var i in settings)
  {
    //test if the setting start with a low character
    if(i.charAt(0).search("[a-z]") !== 0)
    {
      console.warn("Settings should start with a low character: '" + i + "'");
    }

    //we know this setting, so we overwrite it
    if(exports[i] !== undefined)
    {
      exports[i] = settings[i];
    }
    //this setting is unkown, output a warning and throw it away
    else
    {
      console.warn("Unknown Setting: '" + i + "'. This setting doesn't exist or it was removed");
    }
  }

};

// initially load settings
exports.reloadSettings();
