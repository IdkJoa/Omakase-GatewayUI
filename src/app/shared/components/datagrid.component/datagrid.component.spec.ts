import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatagridComponent } from './datagrid.component';
import { provideHttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';
import { vi } from 'vitest';

describe('DatagridComponent', () => {
  let component: DatagridComponent<any>;
  let fixture: ComponentFixture<DatagridComponent<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatagridComponent],
      providers: [
        provideHttpClient(),
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DatagridComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('columns', [{ field: 'id', header: 'ID' }]);
    fixture.componentRef.setInput('data', [{ id: 1 }, { id: 2 }]);
    fixture.detectChanges();
  });

  it('1. should create datagrid component', () => {
    expect(component).toBeTruthy();
  });

  it('2. should initialize default input signal values correctly', () => {
    expect(component.totalRecords()).toBe(0);
    expect(component.loading()).toBe(false);
    expect(component.paginator()).toBe(true);
    expect(component.lazy()).toBe(true);
    expect(component.rows()).toBe(20);
    expect(component.actionsHeader()).toBe('ACCIONES');
  });

  it('3. should handle onTableLazyLoad and calculate currentPage accurately', () => {
    const paramsSpy = vi.spyOn(component.paramsGrid, 'emit');
    const lazySpy = vi.spyOn(component.lazyLoad, 'emit');

    const event: TableLazyLoadEvent = { first: 20, rows: 20 };
    component.onTableLazyLoad(event);

    expect(lazySpy).toHaveBeenCalledWith(event);
    expect(paramsSpy).toHaveBeenCalledWith({
      page: 2,
      pageSize: 20
    });
  });

  it('4. should calculate page 1 when first is 0 in onTableLazyLoad', () => {
    const paramsSpy = vi.spyOn(component.paramsGrid, 'emit');

    component.onTableLazyLoad({ first: 0, rows: 10 });
    expect(paramsSpy).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10
    });
  });

  it('5. should merge extraParams into paramsGrid emission', () => {
    fixture.componentRef.setInput('extraParams', { filter: 'active', search: 'test' });
    fixture.detectChanges();

    const paramsSpy = vi.spyOn(component.paramsGrid, 'emit');
    component.emitParamsGrid();

    expect(paramsSpy).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
      filter: 'active',
      search: 'test'
    });
  });

  it('6. should reset page to 1 when onFilterChange is called', () => {
    component.onTableLazyLoad({ first: 40, rows: 20 }); // Sets page = 3

    const paramsSpy = vi.spyOn(component.paramsGrid, 'emit');
    component.onFilterChange();

    expect(paramsSpy).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20
    });
  });

  it('7. should NOT emit paramsGrid when lazy mode is disabled', () => {
    fixture.componentRef.setInput('lazy', false);
    fixture.detectChanges();

    const paramsSpy = vi.spyOn(component.paramsGrid, 'emit');
    component.emitParamsGrid();

    expect(paramsSpy).not.toHaveBeenCalled();
  });

  it('8. should use default rows value if event.rows is null or undefined in lazy load', () => {
    fixture.componentRef.setInput('rows', 15);
    fixture.detectChanges();

    const paramsSpy = vi.spyOn(component.paramsGrid, 'emit');
    component.onTableLazyLoad({ first: 30, rows: undefined });

    expect(paramsSpy).toHaveBeenCalledWith({
      page: 3,
      pageSize: 15
    });
  });

  it('9. should handle empty columns list without crashing', () => {
    expect(() => {
      fixture.componentRef.setInput('columns', []);
      fixture.detectChanges();
    }).not.toThrow();
  });

  it('10. should reference getColumnWidth function property correctly', () => {
    expect(component.getColumnWidth).toBeDefined();
    expect(typeof component.getColumnWidth).toBe('function');
    expect(component.getColumnWidth('timestamp')).toBe('18%');
  });
});
