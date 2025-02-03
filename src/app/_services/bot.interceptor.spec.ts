import { TestBed } from '@angular/core/testing';

import { BotInterceptor } from './bot.interceptor';

describe('BotInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      BotInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: BotInterceptor = TestBed.inject(BotInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
