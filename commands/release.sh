SWARM_CMD=~/.go/src/github.com/ethersphere/swarm/cmd/swarm/swarm
cd ..
#node_modules/@angular/cli/bin/ng build --prod
node_modules/@angular/cli/bin/ng build
NEW_HASH=$($SWARM_CMD --bzzapi http://localhost:8500 --defaultpath dist/WritingSwarm/index.html --enable-pinning --recursive up dist/WritingSwarm)

#NEW_HASH=$($SWARM_CMD --bzzapi https://swarm-gateways.net --defaultpath dist/WritingSwarm/index.html --recursive up dist/WritingSwarm)

$SWARM_CMD --bzzaccount ../swarmkey --bzzapi http://localhost:8500 feed update --name WritingSwarm 0x$NEW_HASH

## This maybe is unnecessary
#$SWARM_CMD --bzzaccount ../swarmkey --bzzapi https://swarm-gateways.net feed update --name WritingSwarm 0x$NEW_HASH
## Other option could be
#(cd dist/WritingSwarm || tar cvf ../../writingswarm.tar *)
#curl -H "Content-Type: application/x-tar" --data-binary @writingswarm.tar http://localhost:8500/bzz:/
##But no idea how to set default index.html file in this option
