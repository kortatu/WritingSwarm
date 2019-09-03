import {Injectable} from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';
import {createHex, hexValue} from '@erebos/hex';
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
        const topicHex = createHex(topic).value;
        const userHex = createHex(user).value;
        console.log(`Topic ${topicHex} user ${userHex}`);

        const feedContent = this.http.get(
            `${this.proxy}/bzz-feed:/?name=${topic}&user=${userHex}`,
            {responseType: 'arraybuffer'}
        );
        const buffer = await feedContent.toPromise()
            .catch(reason => {
                console.log('Error reason', reason);
                return null;
            });
        if (buffer != null) {
            const hex = Buffer.from(new Uint8Array(buffer)).toString('hex');
            console.log("hex", hex);
            return hex;
        } else {
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
        await this.bzz.setFeedContentHash(feedParams, content);
        console.log('Updated feed hash');
    }
}

export interface IFeed {
    content: string;
}
