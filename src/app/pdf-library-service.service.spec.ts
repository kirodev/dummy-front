import { TestBed } from '@angular/core/testing';

import { PdfLibraryService } from './pdf-library-service.service';

describe('PdfLibraryServiceService', () => {
  let service: PdfLibraryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PdfLibraryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
