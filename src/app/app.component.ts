import {Component, OnInit, ViewChild} from '@angular/core';
import {environment} from '../environments/environment';
import {SwarmService} from './swarm.service';
import {EventsService} from './events.service';
import {FeedsService} from './feeds.service';
import {hexValue} from '@erebos/hex';
import {MatDialog} from '@angular/material';
import {NewfileComponent, NewfileData} from './newfile/newfile.component';
import {FileUploadModel, UploadProgressComponent} from './upload-progress/upload-progress.component';
import {ProjectFile} from './project-files';
import {ProjectFilesViewerComponent} from './project-files-viewer/project-files-viewer.component';

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
    public content: string;
    public currentFile: ProjectFile;
    public rootHash = environment.rootHash;
    public messageReceived: string;
    public topic: string = environment.defaultTopic;
    public user: hexValue;
    public creating: boolean;
    public loadingContent: boolean;
    public editProject: boolean;
    public messagesEnabled = false;
    // TODO: take from currentFile.contentType
    public contentType = "text/markdown";
    public debug = !environment.production;
    @ViewChild("projectFilesViewer", {static: false})
    private projectFilesViewer: ProjectFilesViewerComponent;

    constructor(
      private swarmService: SwarmService,
      private eventsService: EventsService,
      private feedsService: FeedsService,
      private matDialog: MatDialog) {
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
        } else {
            // creating feed
            this.creating = true;
            const feedhash = await this.feedsService.createFeed(this.topic, this.user, environment.rootHash);
            console.log('New feed created!', feedhash.toString());
            this.rootHash = await this.feedsService.listFeed(this.topic, this.user);
            this.creating = false;
        }
    }

    private async subscribeMessages() {
        await this.eventsService.initConnections();
        await this.eventsService.subscribeToTopic(payload => {
            this.messageReceived = payload.msg.toString();
            console.log(`received message from ${payload.key}: ${payload.msg.toString()}`);
        });
    }

    async loadEntry(entry: ProjectFile): Promise<void> {
        this.currentFile = entry;
        this.contentType = entry.contentType;
        if (entry.contentType.startsWith('text/')) {
            this.loadingContent = true;
            this.content = await this.loadContent(entry);
            this.loadingContent = false;
        } else {
            this.currentFile = entry;
            this.content = environment.swarmProxy + "/bzz-raw:/" + entry.hash;
        }
    }

    async loadContent(projectFile: ProjectFile): Promise<string> {
        if (projectFile.contentType.startsWith("text")) {
          return  await this.swarmService.getStringContent(this.rootHash + "/" + projectFile.fullPath);
        } else if  (projectFile.contentType.startsWith("image")) {
          return projectFile.contentUrl();
        }
        return "";
    }

    async saveContent(content: string): Promise<void> {
        const currentFullPath = this.currentFile.fullPath;
        const newRoot = await this.swarmService.saveFileContent(this.rootHash, currentFullPath, content);
        localStorage.setItem('rootHash', newRoot);
        console.log("Saving new feed hash", newRoot);
        await this.feedsService.updateFeedTopic(this.topic, this.user, newRoot);
        this.rootHash = newRoot;
        this.content = content;
    }

    async openNewDialog(): Promise<void> {
        const dialogRef = this.matDialog.open(NewfileComponent, {
            width: '450px',
            data: {name: '', type: 'md'} as NewfileData,
        });
        const result: NewfileData = await dialogRef.afterClosed().toPromise();
        if (result !== undefined) {
            let fullPath = result.name;
            if (result.type === 'md') {
                if (!result.name.endsWith(".md")) {
                    fullPath = result.name + ".md";
                }
                this.addNewEmptyFile(fullPath, "# " + result.name);
            } else if (result.type === 'image') {
                this.uploadNewFile(fullPath, result.blob);
            }
        }
        return;
    }

    async addNewEmptyFile(fullPath: string, content: string): Promise<void> {
        const newRoot = await this.swarmService.saveFileContent(this.rootHash, fullPath, content);
        localStorage.setItem('rootHash', newRoot);
        await this.feedsService.updateFeedTopic(this.topic, this.user, newRoot);
        this.rootHash = newRoot;
        // TODO: define dirPath
        const dirPath = "";
        if (fullPath.indexOf("/") === -1 ) {
            fullPath = dirPath + fullPath;
        }
        this.projectFilesViewer.selectPath(fullPath);
        this.content = content;
    }

    async uploadNewFile(fullPath: string, content: Blob): Promise<void> {
        const f = () => {
            return this.swarmService.observeAddBinaryContent(this.rootHash, fullPath, content);
        };
        const fileUploadProgress = new FileUploadModel<string>(fullPath, f);
        await this.openProgressDialog(fileUploadProgress);
    }

    sendMessage() {
        this.eventsService.sendMessage(this.content);
    }

    async setKey(key: string): Promise<void> {
        localStorage.setItem(AppComponent.property(KEY_PROPERTY), key);
        await this.initServices(key);
    }

    removeKey() {
        this.user = null;
        localStorage.removeItem(AppComponent.property(KEY_PROPERTY));
        this.content = null;
        this.rootHash = null;
    }

    async changeProject() {
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

    private async openProgressDialog(fileUploadProgress: FileUploadModel<string>): Promise<void> {
        const dialogRef = this.matDialog.open(UploadProgressComponent, {
            width: '450px',
            data: fileUploadProgress
        });
        const fileUploadResult = await dialogRef.afterClosed().toPromise() as FileUploadModel<string>;
        if (!fileUploadResult.failed) {
            await this.finishedBinaryUpload(fileUploadResult.result, fileUploadResult.fileName);
        }
    }

    private async finishedBinaryUpload(newRoot: string, fullPath: string) {
        localStorage.setItem('rootHash', newRoot);
        await this.feedsService.updateFeedTopic(this.topic, this.user, newRoot);
        this.rootHash = newRoot;
        // await this.listEntries();
        if (fullPath.indexOf("/") === -1) {
            // TODO: define dirPath
            const dirPath = "";
            fullPath = dirPath + fullPath;
        }
        this.projectFilesViewer.selectPath(fullPath);
    }
}
