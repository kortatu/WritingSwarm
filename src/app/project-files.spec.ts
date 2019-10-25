import {ProjectFile, ProjectFiles} from './project-files';
import {IBzzListEntry} from './swarm.service';
import {from, iif, merge, Observable, of} from 'rxjs';
import {concatMap, expand, mergeMap} from 'rxjs/operators';

class MockSwarmService {

}
describe('ProjectFiles', () => {
    it('should be created from bzz list entry', () => {
        const hash = 'a0';
        const entry = {
            hash,
            path: "dir1/dir2/file",
            mod_time: new Date(),
            size: 100,
        } as IBzzListEntry;
        const projectFile = ProjectFile.FromBzzListEntry(entry);
        expect(projectFile.hash).toBe(hash);
        expect(projectFile.fileName).toBe('file');
        expect(projectFile.path).toBe('dir1/dir2');
        expect(projectFile.type).toBe('file');
        expect(projectFile.modTime).toBe(entry.mod_time);
        expect(projectFile.size).toBe(entry.size);
    });

    it('Observable recursively iterates all files', () => {
        const entryListMain = [{
            path: "file1.txt",
            hash: "1",
        }, {
            path: "file2.txt",
            hash: "1",
        }];
        const entryListSub = [{
            path: "fileSub1.txt",
            hash: "1",
        }, {
            path: "fileSub2.txt",
            hash: "1",
        }];
        const mockSwarmService = jasmine.createSpyObj('SwarmService', ['listPath', 'observeListPath']);
        const toProjectFile = entry => ProjectFile.FromBzzListEntry(entry as IBzzListEntry);
        const mainFiles = entryListMain.map( toProjectFile);
        const projectFiles = new ProjectFiles(mockSwarmService);
        projectFiles.files = mainFiles;
        const subProjectFiles = new ProjectFiles(mockSwarmService);
        subProjectFiles.files = entryListSub.map(toProjectFile);
        const subDirectory = new ProjectFile('directory');
        subDirectory.fullPath = 'sub';
        subDirectory.fileName = 'sub';
        subDirectory.children = subProjectFiles;
        projectFiles.files.push(subDirectory);

        const projectFileObservable = projectFiles.subscribeToFilesRecursively();
        let count = 0;
        expect(projectFileObservable).toBeDefined();
        projectFileObservable.subscribe((pf) => {
            count++;
            console.log("FILENAME " + pf.fileName);
        });
        expect(count).toBe(5);
    });
});
