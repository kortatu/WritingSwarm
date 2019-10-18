import {IBzzListEntries, IBzzListEntry, SwarmService} from './swarm.service';
import {environment} from '../environments/environment';
import {Observable, from} from 'rxjs';
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

    static async FromBzzListEntries(rootHash: string, entries: IBzzListEntries, swarmService: SwarmService): Promise<ProjectFiles> {
        const projectFiles = new ProjectFiles();
        if (entries.entries) {
            projectFiles.files = entries.entries.map(ProjectFile.FromBzzListEntry);
        } else {
            projectFiles.files = [];
        }
        await projectFiles.addSubdirectories(rootHash, entries.common_prefixes, swarmService);
        return projectFiles;
    }

    public findDirectChild(fullPath: string): ProjectFile {
        if (!fullPath) {
            return undefined;
        }
        const [foundFile] = this.files.filter(file => file.fullPath === fullPath);
        return foundFile;
    }

    public findDirectChildRecursive(fullPath: string): {file: ProjectFile, parents: ProjectFile[]} {
        if (!fullPath) {
            return undefined;
        }
        for (const projectFile of this.files) {
            if (projectFile.fullPath === fullPath) {
                return {file: projectFile, parents: []};
            } else if (projectFile.isDirectory() && fullPath.startsWith(projectFile.fullPath)) {
                const findDirectChildRecursive = projectFile.children.findDirectChildRecursive(fullPath);
                if (findDirectChildRecursive) {
                    return {file: findDirectChildRecursive.file, parents: [projectFile].concat(findDirectChildRecursive.parents)};
                }
                return undefined;
            }
        }
        return undefined;
    }

    private async addSubdirectories(rootHash: string, commonPrefixes: string[], swarmService: SwarmService): Promise<void> {
        if (commonPrefixes) {
            const subs = await Promise.all(commonPrefixes.map(async (subName: string) => {
                const projectFileSub = new ProjectFile('directory');
                projectFileSub.fullPath = subName;
                const pathElements = subName.split("/");
                if (pathElements.length > 1) {
                    projectFileSub.fileName = pathElements[pathElements.length - 2];
                    pathElements.splice(pathElements.length - 2, 2);
                } else {
                    projectFileSub.fileName = pathElements[pathElements.length - 1];
                    pathElements.splice(pathElements.length - 1);
                }
                projectFileSub.path = pathElements.join("/");
                const childrenEntries = await swarmService.listPath(rootHash + "/" + subName);
                projectFileSub.children = await ProjectFiles.FromBzzListEntries(rootHash, childrenEntries, swarmService);
                return projectFileSub;
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
    constructor(type: fileType) {
        this.type = type;
    }

    static FromBzzListEntry(bzzListEntry: IBzzListEntry): ProjectFile {
        const file = new ProjectFile('file');
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

    contentUrl(): string {
        // TODO: different urls depending on type/contentType
        return environment.swarmProxy + "/bzz-raw:/" + this.hash;
    }

    isDirectory() {
        return this.type === 'directory';
    }
}
