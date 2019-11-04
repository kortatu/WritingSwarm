![WritingSwarm](https://raw.githubusercontent.com/kortatu/WritingSwarm/master/src/app/assets/Writing%20Swarm-logo-black_lifesavers_bee.png)
# WritingSwarm

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.1.3.

This is a Dapp (distributed app) for collaborative writing with an Etheresphere Swarm backend (`https://swarm.ethereum.org/`)

You can visit [Writing Swarm][] project on the public gateways.

[Writing Swarm]: https://swarm-gateways.net/bzz:/f47d20444fbef9551e53224c233f02f6ab30a746f88cf47645e5937d4e9d6369/

## Developing

To develop locally the best way is to launch `ng serve` and have a running swarm node locally. Swarm can be downloaded from [here](https://ethersphere.github.io/swarm-home/downloads/). We are using version +0.5.2.

To launch swarm you can just execute swarm command, but in order to have enabled PSS messages, you need to activate websockets. These are the usual launch params:

```sh
swarm   --httpaddr 0.0.0.0 \
        --port 30400 \
        --corsdomain=* \
        --ws --wsport 8501 --wsorigins=* \
        --verbosity 3
```
