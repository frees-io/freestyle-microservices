import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WsViewerComponent } from './ws-viewer.component';

describe('WsViewerComponent', () => {
  let component: WsViewerComponent;
  let fixture: ComponentFixture<WsViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WsViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WsViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
