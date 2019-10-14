import {Component, OnInit} from '@angular/core';
import {environment} from '../environments/environment';
import {IBzzListEntries, IBzzListEntry, SwarmService} from './swarm.service';
import {EventsService} from './events.service';
import {FeedsService} from './feeds.service';
import {hexValue} from '@erebos/hex';
import {MatDialog} from '@angular/material';
import {NewfileComponent, NewfileData} from './newfile/newfile.component';

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
    LOGO = require('./assets/Writing Swarm-logo-black_lifesavers_bee.png');
    title = "WritingSwarm";
    public entries: IBzzListEntry[];
    public content: string;
    public currentPath: string;
    public rootHash = environment.rootHash;
    public messageReceived: string;
    public topic: string = environment.defaultTopic;
    public user: hexValue;
    public creating: boolean;
    public editProject: boolean;
    public messagesEnabled = false;
    public contentType = "text/markdown";

    constructor(
      private swarmService: SwarmService,
      private eventsService: EventsService,
      private feedsService: FeedsService,
      private newFileDialog: MatDialog) {
    }

    static property(key): string {
        return PROPERTY_PREFIX + PROPERTY_SEPARATOR + key;
    }

    async ngOnInit(): Promise<void> {
        if (this.messagesEnabled) {
            await this.subscribeMessages();
        }
        const key: string = localStorage.getItem(AppComponent.property(KEY_PROPERTY));
        if (key !== null) {
            await this.initServices(key);
        }
    }

    private async initServices(key: string) {
        this.user = this.feedsService.setKey(key);
        const topic: string = localStorage.getItem(AppComponent.property(TOPIC_KEY));
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
            this.rootHash = await this.feedsService.listFeed(this.topic, this.user);
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

    async loadEntry(entry: IBzzListEntry): Promise<void> {
        this.contentType = entry.contentType;
        if (entry.contentType.startsWith('text/')) {
            return this.loadTextContent(entry.path);
        } else {
            this.currentPath = entry.path;
            this.content = environment.swarmProxy + "/bzz-raw:/" + entry.hash;
        }
    }

    async loadTextContent(path: string): Promise<void> {
      const content: string = await this.swarmService.getStringContent(this.rootHash + "/" + path);
      this.currentPath = path;
      this.content = content;
    }

    async saveContent(content: string): Promise<void> {
        const newRoot = await this.swarmService.saveFileContent(this.rootHash, this.currentPath, content);
        localStorage.setItem('rootHash', newRoot);
        console.log("Saving new feed hash", newRoot);
        await this.feedsService.updateFeedTopic(this.topic, this.user, newRoot);
        console.log("Saved new feed hash");
        this.rootHash = newRoot;
        await this.listEntries();
        this.loadTextContent(this.currentPath);
        this.content = content;
    }

    async openNewDialog(): Promise<void> {
        const dialogRef = this.newFileDialog.open(NewfileComponent, {
            width: '450px',
            data: {name: '', type: 'md'} as NewfileData,
        });
        dialogRef.afterClosed().subscribe((result: NewfileData) => {
            console.log('The dialog was closed');
            if (result !== undefined) {
                let fileName = result.name;
                if (result.type === 'md') {
                    if (!result.name.endsWith(".md")) {
                        fileName = result.name + ".md";
                    }
                    this.addNewFile(fileName, "# " + result.name);
                } else if (result.type === 'image') {
                    console.log("Adding binary content", result.name, result.blob);
                    this.uploadNewFile(fileName, result.blob);
                }
            } else {
                console.log("Cancel add file");
            }
        });
        return;
    }

    async addNewFile(fileName: string, content: string): Promise<void> {
        const newRoot = await this.swarmService.saveFileContent(this.rootHash, fileName, content);
        localStorage.setItem('rootHash', newRoot);
        await this.feedsService.updateFeedTopic(this.topic, this.user, newRoot);
        this.rootHash = newRoot;
        await this.listEntries();
        this.currentPath = fileName;
        this.content = content;
        this.loadTextContent(this.currentPath);
    }

    async uploadNewFile(fileName: string, content: Blob): Promise<void> {
        const newRoot = await this.swarmService.addBinaryContent(this.rootHash, fileName, content);
        localStorage.setItem('rootHash', newRoot);
        await this.feedsService.updateFeedTopic(this.topic, this.user, newRoot);
        this.rootHash = newRoot;
        await this.listEntries();
        const [entry] = this.entries.filter((e: IBzzListEntry) => e.path === fileName);
        this.currentPath = fileName;
        if (entry !== undefined) {
            this.contentType = entry.contentType;
            this.content = environment.swarmProxy + "/bzz-raw:/" + entry.hash;
        }
    }

    private async listEntries(): Promise<void> {
        const listEntries: IBzzListEntries = await this.swarmService.listPath(this.rootHash + '/');
        console.log('Obtained entries', listEntries);
        this.entries = listEntries.entries;
        if (this.entries.length === 1) {
            this.loadTextContent(this.entries[0].path);
        }
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
        localStorage.setItem(AppComponent.property(KEY_PROPERTY), key);
        await this.initServices(key);
    }

    removeKey() {
        this.user = null;
        localStorage.removeItem(AppComponent.property(KEY_PROPERTY));
        this.entries = null;
        this.content = null;
        this.rootHash = null;
    }

    async changeProject() {
        console.log("Saving topic in localStorage", this.topic);
        localStorage.setItem(AppComponent.property(TOPIC_KEY), this.topic);
        await this.initFeed();
        this.editProject = false;
    }

    cancelEditProject() {
        this.topic = localStorage.getItem(AppComponent.property(TOPIC_KEY));
        if (this.topic === null) {
            this.topic = environment.defaultTopic;
        }
        this.editProject = false;
    }
}
