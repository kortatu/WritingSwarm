import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatTreeNestedDataSource} from '@angular/material';
import {ProjectFile, ProjectFiles} from '../project-files';
import {NestedTreeControl} from '@angular/cdk/tree';
import {flatMap, map} from 'rxjs/operators';
import {SwarmService} from '../swarm.service';
import {CollectionViewer} from '@angular/cdk/collections';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-project-files-viewer',
  templateUrl: './project-files-viewer.component.html',
  styleUrls: ['./project-files-viewer.component.css']
})
export class ProjectFilesViewerComponent implements OnInit {
  @Input('rootHash')
  set _rootHash(val: string) {
    this.rootHash = val;
    if (this.rootHash !== null) {
      ProjectFiles.fromRootHash(this.rootHash, this.swarmService).then(pf => this.initFiles(pf));
    } else {
      this.projectFiles = null;
      this.currentFile = null;
    }
  }

  @Output()
  fileSelected: EventEmitter<ProjectFile> = new EventEmitter<ProjectFile>();
  @Output()
  loaded: EventEmitter<boolean> = new EventEmitter<boolean>();

  private rootHash: string;
  private currentFile: ProjectFile;
  private projectFiles: ProjectFiles;
  private forceFullPath: string;
  public dataSource: MatTreeNestedDataSource<ProjectFile>;
  public treeControl: NestedTreeControl<ProjectFile>;

  constructor(private swarmService: SwarmService,
              private ref: ChangeDetectorRef) {
  }

  ngOnInit() {
  }

  public hasChild(_: number, projectFile: ProjectFile): boolean {
    return projectFile.type === 'directory';
  }

  private initFiles(projectFiles: ProjectFiles) {
    this.projectFiles = projectFiles;
    const regularFiles = projectFiles.files.filter(pf => pf.type === 'file');
    if (regularFiles.length === 1) {
      this.selectNode(regularFiles[0]);
    } else {
      if (this.forceFullPath) {
        this.selectPath(this.forceFullPath);
      }
    }
    this.dataSource = this.directoryTreeDataSource(projectFiles.files);
    this.loaded.emit(true);
    this.treeControl = new NestedTreeControl<ProjectFile>(node => {
      if (node.isDirectory()) {
        if (this.currentFile) {
          if (node.children.findDirectChildRecursive(this.currentFile.fullPath)) {
            this.treeControl.expand(node);
            setTimeout(() => {
              this.scrollToCurrentElement();
            }, 1000);
          }
        }
        return node.children.files;
      } else {
        return null;
      }
    });
  }

  private directoryTreeDataSource(projectFiles: ProjectFile[]): MatTreeNestedDataSource<ProjectFile> {
    const matTreeNestedDataSource = new MatTreeNestedDataSource<ProjectFile>();
    matTreeNestedDataSource.data = projectFiles;
    return matTreeNestedDataSource;
    // return new LazyDirectoryDataSource(projectFiles, this.swarmService, this.rootHash);
  }

  selectNode(file: ProjectFile) {
    this.currentFile = file;
    this.fileSelected.emit(file);
  }

  public scrollToCurrentElement() {
    const element = document.querySelector('#hash_' + this.currentFile.hash);
    if (element) {
      element.scrollIntoView({block: 'end'});
    }
  }

  selectPath(fullPath: string) {
    this.forceFullPath = fullPath;
    this.setWithFullPath(this.projectFiles, fullPath);
    this.ref.detectChanges();
  }

  private setWithFullPath(projectFiles: ProjectFiles, fullPath: string) {
    const foundFile = projectFiles.findDirectChildRecursive(fullPath);
    if (foundFile) {
      this.forceFullPath = null;
      this.selectNode(foundFile.file);
      foundFile.parents.forEach(dir => this.treeControl.expand(dir));
      setTimeout(() => {
        this.scrollToCurrentElement();
      }, 200);
    }
  }

}

class LazyDirectoryDataSource extends MatTreeNestedDataSource<ProjectFile> {

  constructor(private projectFiles: ProjectFile[],
              private swarmService: SwarmService,
              private rootHash: string) {
    super();
    this.data = this.projectFiles;
  }


  connect(collectionViewer: CollectionViewer): Observable<ProjectFile[]> {
    return collectionViewer.viewChange.pipe(
        flatMap(listRange => {
          console.log('List range', listRange.start, listRange.end);
          return ProjectFiles.observeRootHash(this.rootHash, this.swarmService).pipe(
              map(projectFiles => projectFiles.files)
          );
        })
    );
  }
}
