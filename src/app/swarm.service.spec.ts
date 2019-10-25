import { TestBed } from '@angular/core/testing';
import { SwarmService } from './swarm.service';
import {FeedsService} from './feeds.service';
import {HttpClient} from '@angular/common/http';

class MockHttpClient {
  constructor() {}
}

describe('SwarmService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    declarations: [],
    providers: [ {provide: HttpClient, useClass: MockHttpClient}]
  }));

  it('should be created', () => {
    const service: SwarmService = TestBed.get(SwarmService);
    expect(service).toBeTruthy();
  });
});
