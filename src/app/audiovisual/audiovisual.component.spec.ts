import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudiovisualComponent } from './audiovisual.component';

describe('AudiovisualComponent', () => {
  let component: AudiovisualComponent;
  let fixture: ComponentFixture<AudiovisualComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AudiovisualComponent]
    });
    fixture = TestBed.createComponent(AudiovisualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
