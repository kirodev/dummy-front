import { TestBed } from '@angular/core/testing';

import { CompanyTypeService } from './company-type.service';

describe('CompanyTypeService', () => {
  let service: CompanyTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompanyTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
