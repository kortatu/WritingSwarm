import {Injectable} from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';
import {hexValue} from '@erebos/hex';
import {Bzz, SignBytesFunc} from '@erebos/api-bzz-browser';
import {pubKeyToAddress} from '@erebos/keccak256';
import {createKeyPair, sign} from '@erebos/secp256k1';

@Injectable({
    providedIn: 'root'
})
export class FeedsService {
    proxy = environment.swarmProxy;
    private bzz: Bzz;
    private user: hexValue;
    public updatePending: boolean;

    constructor(private http: HttpClient) {
    }

    setKey(key: string): hexValue {
        this.user = this.initSigner(key);
        return this.user;
    }

    private initSigner(key: string): hexValue {
        const keyPair = createKeyPair(key);
        const privateK = keyPair.getPrivate('hex');
        console.log("private", privateK);
        const user: hexValue = pubKeyToAddress(keyPair.getPublic('array'));
        const signBytes: SignBytesFunc = async bytes => sign(bytes, keyPair);
        this.bzz = new Bzz({url: this.proxy, signBytes});
        return user;
    }

    public async listFeed(topic: string, user: hexValue): Promise<string> {
        try {
            return await this.bzz.getFeedContentHash({user, name: topic});
        } catch (e) {
            console.log("Feed not found ", topic, user);
            return null;
        }
    }

    public async createFeed(topic: string, user: hexValue, content: string): Promise<hexValue> {
        const manifest = {
            user,
            name: topic,
        };
        const feedHash: hexValue = await this.bzz.createFeedManifest(manifest);
        console.log('Create feed hash', feedHash);
        await this.bzz.setFeedContentHash(feedHash, content);
        console.log('Update feed content hash');
        return feedHash;
    }

    public async updateFeed(feedHash: hexValue, content: string): Promise<void> {
        await this.bzz.setFeedContentHash(feedHash, content);
        console.log('Update feed hash');
    }

    public async updateFeedTopic(topic: string, user: hexValue, content: string): Promise<void> {
        const feedParams = {
            name: topic,
            user,
        };
        this.updatePending = true;
        await this.bzz.setFeedContentHash(feedParams, content);
        console.log('Updated feed hash');
        this.checkCompletedChanges(feedParams, content);
    }

    private checkCompletedChanges(feedParams, expected: string) {
        this.bzz.getFeedContentHash(feedParams).then((hasRetrieved: string) => {
            console.log('Retrieved hash:', hasRetrieved);
            if (hasRetrieved === expected) {
                this.updatePending = false;
            } else {
                console.log('Still waiting:');
                this.checkCompletedChanges(feedParams, expected);
            }
        });
    }
}

export interface IFeed {
    content: string;
}
