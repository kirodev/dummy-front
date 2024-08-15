import { TestBed } from '@angular/core/testing';

import { FetchSynonymsService } from './fetch-synonyms.service';

describe('FetchSynonymsService', () => {
  let service: FetchSynonymsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FetchSynonymsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
