import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {environment} from "../environments/environment";
import {IBzzListEntries, IBzzListEntry, SwarmService} from './swarm.service';
import {EventsService} from './events.service';

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

    constructor(
      private swarmService: SwarmService,
      private eventsService: EventsService) {
    }

    async ngOnInit(): Promise<void> {
        await this.eventsService.initConnections();
        await this.eventsService.subscribeToTopic(payload => {
                this.messageReceived = payload.msg.toString();
                console.log(`received message from ${payload.key}: ${payload.msg.toString()}`);
        });
        const rootHashFromStorage: string = localStorage.getItem('rootHash');
        if (rootHashFromStorage !== null) {
            console.log("Root hash in storage: " + rootHashFromStorage);
            this.rootHash = rootHashFromStorage;
        } else {
            console.log("Root hash not in storage using default: " + this.rootHash);
        }
        this.listEntries();
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
        this.rootHash = newRoot;
        await this.listEntries();
        this.loadPathContent(this.currentPath);
        this.content = content;
    }

    private async listEntries(): Promise<void> {
        const listEntries: IBzzListEntries = await this.swarmService.listPath(this.rootHash + '/testaco/');
        console.log('Obtained entries', listEntries);
        this.entries = listEntries.entries;
    }

    sendMessage() {
        this.eventsService.sendMessage(this.content);
    }
}
