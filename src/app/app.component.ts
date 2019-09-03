import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {environment} from "../environments/environment";
import {IBzzListEntries, IBzzListEntry, SwarmService} from './swarm.service';
import {EventsService} from './events.service';
import {FeedsService} from './feeds.service';
import {hexValue} from '@erebos/hex';

const PROPERTY_PREFIX = 'SwarmWriter';
const PROPERTY_SEPARATOR = '.';
const KEY_PROPERTY = 'key';
const TOPIC_KEY = 'topic';

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
    title = "WritingSwarm";
    private entries: IBzzListEntry[];
    private content: string;
    private currentPath: string;
    private rootHash = environment.rootHash;
    private messageReceived: string;
    private topic: string = environment.defaultTopic;
    private user: hexValue;
    private creating: boolean;
    editProject: boolean;
    private messagesEnabled = false;

    constructor(
      private swarmService: SwarmService,
      private eventsService: EventsService,
      private feedsService: FeedsService) {
    }

    async ngOnInit(): Promise<void> {
        if (this.messagesEnabled) {
        await this.subscribeMessages();
        }
        const key: string = localStorage.getItem(this.property(KEY_PROPERTY));
        if (key !== null) {
            await this.initServices(key);
        }
    }

    private async initServices(key: string) {
        this.user = this.feedsService.setKey(key);
        const topic: string = localStorage.getItem(this.property(TOPIC_KEY));
        if (topic !== null) {
            console.log("Topic loaded from storage", topic);
            this.topic = topic;
        }
        await this.initFeed();
    }

    private async initFeed() {
        const feed = await this.feedsService.listFeed(this.topic, this.user);
        if (feed != null) {
            console.log('Root hash in feed: ' + feed);
            this.rootHash = feed;
            this.listEntries();
        } else {
            // creating feed
            this.creating = true;
            const feedhash = await this.feedsService.createFeed(this.topic, this.user, environment.rootHash);
            console.log('New feed created!', feedhash.toString());
            const feedCreated = await this.feedsService.listFeed(this.topic, this.user);
            this.rootHash = feedCreated;
            this.creating = false;
            this.listEntries();
        }
    }

    private async subscribeMessages() {
        await this.eventsService.initConnections();
        await this.eventsService.subscribeToTopic(payload => {
            this.messageReceived = payload.msg.toString();
            console.log(`received message from ${payload.key}: ${payload.msg.toString()}`);
        });
    }

    async loadPathContent(path: string): Promise<void> {
      const content: string = await this.swarmService.getStringContent(this.rootHash + "/" + path);
      console.log("Obtained content", content);
      this.currentPath = path;
      this.content = content;
    }

    async saveContent(content: string): Promise<void> {
        const newRoot = await this.swarmService.saveFileContent(environment.rootHash, this.currentPath, content);
        localStorage.setItem('rootHash', newRoot);
        console.log("Saving new feed hash", newRoot);
        await this.feedsService.updateFeedTopic('kortatu', this.user, newRoot);
        console.log("Saved new feed hash");
        this.rootHash = newRoot;
        await this.listEntries();
        this.loadPathContent(this.currentPath);
        this.content = content;
    }

    private async listEntries(): Promise<void> {
        const listEntries: IBzzListEntries = await this.swarmService.listPath(this.rootHash + '/');
        console.log('Obtained entries', listEntries);
        this.entries = listEntries.entries;
    }

    sendMessage() {
        this.eventsService.sendMessage(this.content);
    }

    private loadRootHashFromStorageOrDefault() {
        const rootHashFromStorage: string = localStorage.getItem('rootHash');
        if (rootHashFromStorage !== null) {
            console.log('Root hash in storage: ' + rootHashFromStorage);
            this.rootHash = rootHashFromStorage;
        } else {
            console.log('Root hash not in storage using default: ' + this.rootHash);
        }
    }

    async setKey(key: string): Promise<void> {
        localStorage.setItem(this.property(KEY_PROPERTY), key);
        await this.initServices(key);
    }

    removeKey() {
        this.user = null;
        localStorage.removeItem(this.property(KEY_PROPERTY));
        this.entries = null;
        this.content = null;
        this.rootHash = null;
    }

    private property(key) {
        return PROPERTY_PREFIX + PROPERTY_SEPARATOR + key;
    }

    async changeProject() {
        console.log("Saving topic in localStorage", this.topic);
        localStorage.setItem(this.property(TOPIC_KEY), this.topic);
        await this.initFeed();
        this.editProject = false;
    }

    cancelEditProject() {
        this.topic = localStorage.getItem(this.property(TOPIC_KEY));
        if (this.topic === null) {
            this.topic = environment.defaultTopic;
        }
        this.editProject = false;
    }
}
