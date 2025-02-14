import { TestBed } from '@angular/core/testing';

import { OcrDetectionService } from './ocr-detection.service';

describe('OcrDetectionService', () => {
  let service: OcrDetectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OcrDetectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
