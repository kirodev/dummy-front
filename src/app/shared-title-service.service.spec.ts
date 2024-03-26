import { TestBed } from '@angular/core/testing';

import { SharedTitleServiceService } from './shared-title-service.service';

describe('SharedTitleServiceService', () => {
  let service: SharedTitleServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedTitleServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
