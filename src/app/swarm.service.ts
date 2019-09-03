import {Injectable} from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class SwarmService {
    proxy = environment.swarmProxy;
    constructor(private http: HttpClient) { }

    public listPath(path: string): Promise<IBzzListEntries> {
        return this.http.get<IBzzListEntries>(this.proxy + "/bzz-list:/" + path).toPromise();
    }

    public getStringContent(path: string): Promise<string> {
        return this.http.get(
            this.proxy + '/bzz:/' + path, { responseType: 'text' }).toPromise();
    }

    /**
     * curl -F "file2.txt={Modified file} ;type=text/plain" http://localhost:8500/bzz:/{hash}
     * @param rootHash has of the swarm content root
     * @param filePath path to the location of the new or modified file
     * @param value content of the file (text-plain)
     */
    saveFileContent(rootHash: string, filePath: string, value: string): Promise<string> {
        const formData = new FormData();
        const blob = new Blob([value], { type: "text/plain"});
        formData.append(filePath, blob, filePath);
        const url = this.proxy + '/bzz:/' + rootHash;
        return this.http.post(url, formData, {responseType: 'text'}).toPromise();
    }
}

export interface IBzzListEntries {
    entries: IBzzListEntry[];
}

export interface IBzzListEntry {
    path: string;
    hash: string;
}
