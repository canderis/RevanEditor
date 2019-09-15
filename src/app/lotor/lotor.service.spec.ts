import { TestBed } from '@angular/core/testing';

import { LotorService } from './lotor.service';

describe('LotorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LotorService = TestBed.get(LotorService);
    expect(service).toBeTruthy();
  });
});
