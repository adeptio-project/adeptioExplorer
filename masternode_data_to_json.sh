#!/usr/bin/env bash

/usr/bin/adeptio-cli masternode list full > /home/explorer/explorer/public/jsondata/masternode_full_list.json
/usr/bin/adeptio-cli masternode list full | awk '{print $7}' > /home/explorer/explorer/public/jsondata/masternode_full_node_list.json
