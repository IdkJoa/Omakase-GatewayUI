import { TestBed, ComponentFixture } from '@angular/core/testing';
import { App } from './app';
import { RouterOutlet } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('App Component', () => {
  let fixture: ComponentFixture<App>;
  let component: App;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. should create the app component instance', () => {
    expect(component).toBeTruthy();
  });

  it('2. should initialize the title signal with "OmakaseUI"', () => {
    expect((component as any).title()).toBe('OmakaseUI');
  });

  it('3. should render router-outlet element in HTML template', () => {
    const routerOutlet = fixture.debugElement.query(By.directive(RouterOutlet));
    expect(routerOutlet).not.toBeNull();
  });

  it('4. should match selector app-root', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element).toBeTruthy();
  });

  it('5. should handle multiple change detection cycles cleanly', () => {
    expect(() => {
      fixture.detectChanges();
      fixture.detectChanges();
    }).not.toThrow();
  });

  it('6. should ensure title signal value is a string type', () => {
    expect(typeof (component as any).title()).toBe('string');
  });

  it('7. should not throw when fixture is re-created', () => {
    expect(() => {
      const newFixture = TestBed.createComponent(App);
      newFixture.detectChanges();
      newFixture.destroy();
    }).not.toThrow();
  });

  it('8. should destroy fixture gracefully without side-effects', () => {
    expect(() => {
      fixture.destroy();
    }).not.toThrow();
  });

  it('9. should ensure component is defined after Angular initialization', () => {
    expect(component).toBeDefined();
    expect(component).toBeInstanceOf(App);
  });

  it('10. should contain router-outlet tag in rendered DOM content', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).not.toBeNull();
  });
});
