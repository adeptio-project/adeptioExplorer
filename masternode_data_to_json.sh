#!/usr/bin/env bash

/usr/bin/adeptio-cli masternode list full > /home/explorer/explorer/public/jsondata/masternode_full_list.json
/usr/bin/adeptio-cli masternode list full | awk '{print $7}' > /home/explorer/explorer/public/jsondata/masternode_full_node_list.json
curl -s https://explorer.adeptio.cc/ext/getlasttxs/1/1 | cut -d: -f9 | grep -Eo '[+-]?[0-9]+([.][0-9]+)?'| head -c 3 > /home/explorer/explorer/public/jsondata/block_reward.json
curl -s https://explorer.adeptio.cc/ext/getlasttxs/1/1 | cut -d: -f12 | grep -Eo '[+-]?[0-9]+([.][0-9]+)?'| head -c 2 > /home/explorer/explorer/public/jsondata/masternode_reward.json
/usr/bin/adeptio-cli masternode list full | tail -n 10 | awk '{print $7}' > /home/explorer/explorer/public/jsondata/last_10_activated_masternodes.json
du -c ~/.adeptio/blocks/ ~/.adeptio/chainstate/ ~/.adeptio/database/ | grep total | grep -Eo '[+-]?[0-9]+([.][0-9]+)?' > /home/explorer/explorer/public/jsondata/chain_size.json
