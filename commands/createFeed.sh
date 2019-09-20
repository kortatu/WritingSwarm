swarm --bzzaccount swarmkey --bzzapi http://localhost:8500 feed create --name WritingSwarm

f47d20444fbef9551e53224c233f02f6ab30a746f88cf47645e5937d4e9d6369

swarm --bzzaccount swarmkey --bzzapi http://localhost:8500 feed update --name WritingSwarm 0xhash

curl -H "Content-Type: application/x-tar" --data-binary @writingswarm.tar http://localhost:8500/bzz:/
7ab84a8633bbea4438d2021083ede9a6f637f95c2dbf205758279229d3589669


Actualizar feed funciona así
 ~/.go/src/github.com/ethersphere/swarm/cmd/swarm/swarm --bzzkeyhex userPk  --bzzapi http://localhost:8500 feed update --name WritingSwarm 0x29300d86100a2eb9fbfc88eedb496cdec97868deb0289962ffa2a47f9072e22e
