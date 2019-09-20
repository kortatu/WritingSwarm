cd ..
node_modules/@angular/cli/bin/ng build
~/.go/src/github.com/ethersphere/swarm/cmd/swarm/swarm --bzzapi http://localhost:8500 --defaultpath dist/WritingSwarm/index.html --recursive up dist/WritingSwarm

## Other option could be
#(cd dist/WritingSwarm || tar cvf ../../writingswarm.tar *)
#curl -H "Content-Type: application/x-tar" --data-binary @writingswarm.tar http://localhost:8500/bzz:/
##But no idea how to set default index.html file in this option
