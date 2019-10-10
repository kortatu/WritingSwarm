import { TestBed } from '@angular/core/testing';

import { FeedsService } from './feeds.service';
import {HttpClient} from '@angular/common/http';

class MockHttpClient {
  constructor() {}
}
describe('FeedsService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    declarations: [],
    providers: [ {provide: HttpClient, useClass: MockHttpClient}]
  }));

  it('should be created', () => {
    const service: FeedsService = TestBed.get(FeedsService);
    expect(service).toBeTruthy();
  });
});
