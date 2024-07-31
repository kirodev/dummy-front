import { TestBed } from '@angular/core/testing';

import { SharedTitleService } from './shared-title-service.service';

describe('SharedTitleService', () => {
  let service: SharedTitleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedTitleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
