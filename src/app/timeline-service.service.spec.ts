import { TestBed } from '@angular/core/testing';

import { TimelineServiceService } from './timeline-service.service';

describe('TimelineServiceService', () => {
  let service: TimelineServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimelineServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
