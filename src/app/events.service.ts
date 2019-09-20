import {Injectable, OnInit} from '@angular/core';
import { SwarmClient } from '@erebos/swarm-browser';
import webSocketRPC from '@mainframe/rpc-ws-browser';
import {createHex, hexValue} from '@erebos/hex';
import {PssEvent} from '@erebos/api-pss';
import {pubKeyToAddress} from '@erebos/keccak256';
import {environment} from '../environments/environment';

const DEST_PUBLIC_KEY =
    '0x04c1ccb06987b0f3817f3222ab04caba9d94eea75c4f8d0b6e7f589b468374a9231779155c2ed99ad5f92bbae9dd8261c77aaee4621e7941a0f1b659e121b4704e';
// '0x047c234583bb979471f8a9b46f23951b5b4debc5f19f1f065ed630acc6f4c993a5e79c9bd49d6bd5eb66fdd3524a9638ed1a3ea6501e00ffd865385d9df0ed99a2';


@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private wsProxy = environment.swarmWsProxy
  private sender: PssSubject;
  private receiver: PssSubject;
  constructor() {}

  async initConnections(): Promise<void> {
    const swarmReceiver = new SwarmClient({ pss: this.wsProxy});
    const swarmSender = new SwarmClient({ pss: this.wsProxy});

    const [pubKey, testTopic] = await Promise.all([
      swarmSender.pss.getPublicKey(),
      swarmSender.pss.stringToTopic('testTopic'),
    ]);

    this.sender = {
      swarmClient: swarmSender,
      pubKey,
      topic: testTopic,
    };

    const destPublicKey = createHex(DEST_PUBLIC_KEY);
    const destPubKeyString = destPublicKey.value;
    const address = pubKeyToAddress(destPublicKey.toBuffer());
    await swarmSender.pss.setPeerPublicKey(destPubKeyString, testTopic, address);
    this.receiver = {
      swarmClient: swarmReceiver,
      pubKey: destPubKeyString,
      topic: testTopic,
    };
  }

  sendMessage(message: string): void {
    this.sender.swarmClient.pss.sendAsym(
        this.receiver.pubKey,
        this.receiver.topic,
        message);
  }

  async subscribeToTopic(observer: (event: PssEvent) => void): Promise<void> {
    const receiverClient = this.receiver.swarmClient;
    const subscription = await receiverClient.pss.subscribeTopic(this.sender.topic, true);
    const eventObservable = receiverClient.pss.createSubscription(subscription);
    eventObservable.subscribe(observer);
  }
}

interface PssSubject {
  swarmClient: SwarmClient;
  pubKey: hexValue;
  topic: hexValue;
}
