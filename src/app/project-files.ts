import {IBzzListEntries, IBzzListEntry, SwarmService} from './swarm.service';
import {environment} from '../environments/environment';
import {from, iif, merge, Observable, of} from 'rxjs';
import {flatMap} from 'rxjs/operators';

export class ProjectFiles {
    files: ProjectFile[];

    static async fromRootHash(rootHash: string, swarmService: SwarmService): Promise<ProjectFiles> {
        const iBzzListEntries = await swarmService.listPath(rootHash);
        return this.FromBzzListEntries(rootHash, iBzzListEntries, swarmService);
    }

    static observeRootHash(rootHash: string, swarmService: SwarmService): Observable<ProjectFiles> {
        return swarmService.observeListPath(rootHash).pipe(
            flatMap(entries => from(this.FromBzzListEntries(rootHash, entries, swarmService)))
        );
    }

    static async FromBzzListEntries(
        rootHash: string, entries: IBzzListEntries, swarmService: SwarmService, parent?: ProjectFile): Promise<ProjectFiles> {
        const projectFiles = new ProjectFiles(swarmService);
        if (entries.entries) {
            projectFiles.files = entries.entries.map(entry => ProjectFile.FromBzzListEntry(entry, parent));
        } else {
            projectFiles.files = [];
        }
        await projectFiles.addSubdirectories(rootHash, entries.common_prefixes, parent);
        return projectFiles;
    }

    constructor(private swarmService: SwarmService) {
    }

    public findDirectChild(fullPath: string): ProjectFile {
        if (!fullPath) {
            return undefined;
        }
        const [foundFile] = this.files.filter(file => file.fullPath === fullPath);
        return foundFile;
    }

    public findChildRecursive(fullPath: string): ProjectFile {
        if (!fullPath) {
            return undefined;
        }
        for (const projectFile of this.files) {
            if (projectFile.fullPath === fullPath) {
                return projectFile;
            } else if (projectFile.isDirectory() && fullPath.startsWith(projectFile.fullPath)) {
                return projectFile.children.findChildRecursive(fullPath);
            }
        }
        return undefined;
    }

    public findChildRecursiveContentType(contentType: string): ProjectFile {
        return this.findChildRecursiveMatches(pf => pf.contentType && pf.contentType.startsWith(contentType));
    }


    public findChildRecursiveMatches(matches: (ProjectFile) => boolean): ProjectFile {
        for (const projectFile of this.files) {
            if (matches(projectFile)) {
                return projectFile;
            } else if (projectFile.isDirectory()) {
                return projectFile.children.findChildRecursiveMatches(matches);
            }
        }
        return undefined;
    }

    public subscribeToFilesRecursively(): Observable<ProjectFile> {
        return from(this.files).pipe(
            flatMap((pf: ProjectFile) => merge(of(pf), pf.childrenObservable()))
        );
    }

    // iif<ProjectFile, ProjectFile>(() => pf.isDirectory(), pf.children.subscribeToFilesRecursively()))

    private async addSubdirectories(rootHash: string, commonPrefixes: string[], parent: ProjectFile): Promise<void> {
        if (commonPrefixes) {
            const subs = await Promise.all(commonPrefixes.map(async (subName: string) => {
                const projectFileSub = new ProjectFile('directory');
                return await projectFileSub.buildSubDirectory(rootHash, subName, this.swarmService, parent);
            }));
            this.files = this.files.concat(subs);
        }
    }

}

type fileType = 'file' | 'directory';

export class ProjectFile {
    type: fileType;
    hash: string;
    fullPath: string;
    path: string;
    fileName: string;
    size: number;
    modTime: Date;
    contentType: string;
    children: ProjectFiles;
    parent: ProjectFile;
    constructor(type: fileType) {
        this.type = type;
    }

    static FromBzzListEntry(bzzListEntry: IBzzListEntry, parent?: ProjectFile): ProjectFile {
        const file = new ProjectFile('file');
        file.parent = parent;
        file.hash = bzzListEntry.hash;
        file.fullPath =  bzzListEntry.path;
        const pathElements = bzzListEntry.path.split("/");
        file.fileName = pathElements[pathElements.length - 1];
        pathElements.splice(pathElements.length - 1);
        file.path = pathElements.join("/");
        file.size = bzzListEntry.size;
        file.modTime = bzzListEntry. mod_time;
        file.contentType = bzzListEntry.contentType;
        return file;
    }

    async buildSubDirectory(rootHash: string, subName: string, swarmService: SwarmService, parent: ProjectFile) {
        this.parent = parent;
        this.fullPath = subName;
        const pathElements = subName.split('/');
        if (pathElements.length > 1) {
            this.fileName = pathElements[pathElements.length - 2];
            pathElements.splice(pathElements.length - 2, 2);
        } else {
            this.fileName = pathElements[pathElements.length - 1];
            pathElements.splice(pathElements.length - 1);
        }
        this.path = pathElements.join('/');
        const childrenEntries = await swarmService.listPath(rootHash + '/' + subName);
        this.children = await ProjectFiles.FromBzzListEntries(rootHash, childrenEntries, swarmService, this);
        return this;
    }

    parents(): ProjectFile[] {
        const parents = [];
        let currentParent = this.parent;
        while (currentParent !== undefined) {
            parents.push(currentParent);
            currentParent = currentParent.parent;
        }
        return parents;
    }

    contentUrl(): string {
        // TODO: different urls depending on type/contentType
        return environment.swarmProxy + "/bzz-raw:/" + this.hash;
    }

    isDirectory() {
        return this.type === 'directory';
    }

    childrenObservable(): Observable<ProjectFile> {
        return this.isDirectory() ? this.children.subscribeToFilesRecursively() : of<ProjectFile>();
    }
}
