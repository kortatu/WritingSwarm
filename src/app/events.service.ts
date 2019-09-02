import {Injectable, OnInit} from '@angular/core';
import { SwarmClient } from '@erebos/swarm-browser';
import webSocketRPC from '@mainframe/rpc-ws-browser';
import newHex, {hexValue} from '@erebos/hex';
import {PssEvent} from '@erebos/api-pss';

const DEST_PUBLIC_KEY =
    '0x047c234583bb979471f8a9b46f23951b5b4debc5f19f1f065ed630acc6f4c993a5e79c9bd49d6bd5eb66fdd3524a9638ed1a3ea6501e00ffd865385d9df0ed99a2';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private subject1: PssSubject;
  private subject2: PssSubject;
  constructor() {}

  async initConnections(): Promise<void> {
    const swarmClient1 = new SwarmClient({ pss: 'ws://localhost:8501'});

    const [key, testTopic] = await Promise.all([
      swarmClient1.pss.getPublicKey(),
      swarmClient1.pss.stringToTopic('testTopic'),
    ]);

    this.subject1 = {
      swarmClient: swarmClient1,
      pubKey: key,
      topic: testTopic,
    };

    const destPubKey = newHex(DEST_PUBLIC_KEY).value;
    await swarmClient1.pss.setPeerPublicKey(destPubKey, testTopic);
    this.subject2 = {
      swarmClient: null,
      pubKey: destPubKey,
      topic: testTopic,
    };
  }

  sendMessage(message: string): void {
    this.subject1.swarmClient.pss.sendAsym(
        this.subject2.pubKey,
        this.subject2.topic,
        message);
  }

  async subscribeToTopic(observer: (event: PssEvent) => void): Promise<void> {
    const senderClient = this.subject1.swarmClient;
    const subscription = await senderClient.pss.subscribeTopic(this.subject1.topic);
    console.log("Obtained subscription", subscription);
    const eventObservable = senderClient.pss.createSubscription(subscription);
    eventObservable.subscribe(observer);
  }
}

interface PssSubject {
  swarmClient: SwarmClient;
  pubKey: hexValue;
  topic: hexValue;
}
