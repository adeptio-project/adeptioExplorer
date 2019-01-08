![Alt text](https://explorer.adeptio.cc/images/adeptio.png)

# Adeptio eXplorer - v2.0.0.0

Adeptio eXplorer base ground [Iquidus Explorer](https://github.com/iquidus/explorer). All other functions and design belongs to adeptio dev team. Integrated zerocoin protocol.

### See it in action

*  [https://explorer.adeptio.cc](https://explorer.adeptio.cc)

### Requirements

**Ubuntu 16.04 LTS**

**node.js >= 0.10.28**

    curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash - && sudo apt-get install nodejs make   

**mongodb 2.6.x**

    sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927 && sudo apt-get update -y && sudo systemctl start mongod

**adeptiod**

    https://wiki.adeptio.cc/books/adeptio-repository/page/apt-repository-for-ubuntu-1604-1804

### Create database

Enter MongoDB cli:

    $ mongo

Create databse:

    > use explorerdb

Create user with read/write access:

    > db.createUser( { user: "adeptiouser", pwd: "YourStrong5Pass7Here_", roles: [ "readWrite" ] } )

*note: If you're using mongo shell 2.4.x, use the following to create your user:

    > db.addUser( { user: "username", pwd: "password", roles: [ "readWrite"] })

### Get the source

    git clone https://github.com/adeptio-project/adeptioExplorer.git

### Install node modules

    cd adeptioExplorer && npm install --production

### Configure

    vim ./settings.json

*Make required changes in settings.json*

### SystemD process:

vim /etc/systemd/system/explorer.service

    [Unit]
    Description=npm service
    After=network.target

    [Service]
    User=root
    Group=root
    WorkingDirectory=/home/explorer/adeptioExplorer
    ExecStart=/usr/bin/npm start
    TimeoutSec=120

    [Install]
    WantedBy=multi-user.target

### Enable & Start Explorer

    sudo systemctl enable explorer
    sudo systemctl start explorer

*note: mongod must be running to start the explorer*

As of version 1.4.0 the explorer defaults to cluster mode, forking an instance of its process to each cpu core. This results in increased performance and stability. Load balancing gets automatically taken care of and any instances that for some reason die, will be restarted automatically. For testing/development (or if you just wish to) a single instance can be launched with

    node --stack-size=10000 bin/instance

To stop the cluster you can use

    sudo systemctl stop explorer

### Check adeptiocore service:

vim ~/check_adeptiocore_service.sh 

    #!/usr/bin/env bash

    pid=$(pgrep adeptiod)

    if [ -z "$pid" ]; then
	sudo systemctl restart adeptiocore
    fi
    
*note: add this to crontab: */15 * * * * ~/check_adeptiocore_service.sh 

### Syncing databases with the blockchain

sync.js (located in scripts/) is used for updating the local databases. This script must be called from the explorers root directory.

    Usage: node scripts/sync.js [database] [mode]

    database: (required)
    index [mode] Main index: coin info/stats, transactions & addresses
    market       Market data: summaries, orderbooks, trade history & chartdata

    mode: (required for index database only)
    update       Updates index from last sync to current block
    check        checks index for (and adds) any missing transactions/addresses
    reindex      Clears index then resyncs from genesis to current block

    notes:
    * 'current block' is the latest created block when script is executed.
    * The market database only supports (& defaults to) reindex mode.
    * If check mode finds missing data(ignoring new data since last sync),
      index_timeout in settings.json is set too low.

*It is recommended to have this script launched via a cronjob at 2+ min intervals.*

**crontab**

*Example crontab; update index every minute and market data every 2 minutes*

    */2 * * * * cd ~/adeptioExplorer && /usr/bin/nodejs scripts/sync.js index update > /dev/null 2>&1
    */5 * * * * cd ~/adeptioExplorer && /usr/bin/nodejs scripts/sync.js market > /dev/null 2>&1
    */15 * * * * cd ~/adeptioExplorer && /usr/bin/nodejs scripts/peers.js > /dev/null 2>&1
    */5 * * * * ~/adeptioExplorer/masternode_data_to_json.sh
    */15 * * * * ~/check_adeptiocore_service.sh 

forcesync.sh and forcesynclatest.sh (located in scripts/) can be used to force the explorer to sync at the specified block heights

### Wallet

The wallet connected to eXplorer must be running with atleast the following flags:

    -daemon -txindex

### Known Issues

**script is already running.**

If you receive this message when launching the sync script either a) a sync is currently in progress, or b) a previous sync was killed before it completed. If you are certian a sync is not in progress remove the index.pid from the tmp folder in the explorer root directory.

    rm tmp/index.pid

**exceeding stack size**

    RangeError: Maximum call stack size exceeded

Nodes default stack size may be too small to index addresses with many tx's. If you experience the above error while running sync.js the stack size needs to be increased.

To determine the default setting run

    node --v8-options | grep -B0 -A1 stack_size

To run sync.js with a larger stack size launch with

    node --stack-size=[SIZE] scripts/sync.js index update

Where [SIZE] is an integer higher than the default.

*note: SIZE will depend on which blockchain you are using, you may need to play around a bit to find an optimal setting*

### License

Copyright (c) 2018-2019, The Adeptio Dev Team
Copyright (c) 2017, The Chaincoin Community  
Copyright (c) 2015, Iquidus Technology  
Copyright (c) 2015, Luke Williams  
All rights reserved.
