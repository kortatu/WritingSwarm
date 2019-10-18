import {Injectable} from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient, HttpEvent, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SwarmService {
    proxy = environment.swarmProxy;
    constructor(private http: HttpClient) { }

    public async listPath(path: string): Promise<IBzzListEntries> {
        return await this.http.get<IBzzListEntries>(this.proxy + "/bzz-list:/" + path).toPromise();
    }

    public observeListPath(path: string): Observable<IBzzListEntries> {
        return this.http.get<IBzzListEntries>(this.proxy + "/bzz-list:/" + path);
    }

    public getStringContent(path: string): Promise<string> {
        return this.http.get(
            this.proxy + '/bzz:/' + path, { responseType: 'text' }).toPromise();
    }

    public getBinaryContent(path: string): Promise<ArrayBuffer> {
        return this.http.get(
            this.proxy + '/bzz:/' + path, { responseType: 'arraybuffer' }).toPromise();
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

    addBinaryContent(rootHash: string, filePath: string, value: Blob): Promise<string> {
        const formData = new FormData();
        const blob = new Blob([value], {type: 'image/png'});
        formData.append(filePath, blob, filePath);
        const url = this.proxy + '/bzz:/' + rootHash;
        return this.http.post(url, formData, {responseType: 'text'}).toPromise();
    }

    observeAddBinaryContent(rootHash: string, filePath: string, value: Blob): Observable<HttpEvent<string>> {
        const formData = new FormData();
        const blob = new Blob([value], {type: 'image/png'});
        formData.append(filePath, blob, filePath);
        const url = this.proxy + '/bzz:/' + rootHash;
        const req = new HttpRequest('POST', url, formData, {
            responseType: 'text',
            reportProgress: true
        });
        return this.http.request(req);
    }
}

export interface IBzzListEntries {
    entries: IBzzListEntry[];
    common_prefixes: string[];
}

export interface IBzzListEntry {
    path: string;
    hash: string;
    contentType: string;
    size: number;
    mod_time: Date;
}
