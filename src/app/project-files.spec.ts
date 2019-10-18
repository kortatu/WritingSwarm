import {ProjectFile, ProjectFiles} from './project-files';
import {IBzzListEntry} from './swarm.service';

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
});
