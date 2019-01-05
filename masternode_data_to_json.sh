#!/usr/bin/env bash

/usr/bin/adeptio-cli masternode list > /home/explorer/adeptioExplorer/public/jsondata/masternode_full_list.json
#/usr/bin/adeptio-cli masternode list | awk '{print $7}' > /home/explorer/adeptioExplorer/jsondata/masternode_full_node_list.json
#curl -s https://explorer.adeptio.cc/ext/getlasttxs/1/1 | cut -d: -f9 | grep -Eo '[+-]?[0-9]+([.][0-9]+)?'| head -c 3 > /home/explorer/adeptioExplorer/jsondata/block_reward.json
#curl -s https://explorer.adeptio.cc/ext/getlasttxs/1/1 | cut -d: -f12 | grep -Eo '[+-]?[0-9]+([.][0-9]+)?'| head -c 2 > /home/explorer/adeptioExplorer/public/jsondata/masternode_reward.json
du -c ~/.adeptio/blocks/ ~/.adeptio/chainstate/ ~/.adeptio/database/ | grep total | grep -Eo '[+-]?[0-9]+([.][0-9]+)?' > /home/explorer/adeptioExplorer/public/jsondata/chain_size.json
