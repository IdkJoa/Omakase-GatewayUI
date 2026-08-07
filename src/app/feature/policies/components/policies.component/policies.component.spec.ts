import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PoliciesComponent } from './policies.component';
import { PoliciesService } from '../../services/Policies-services';
import { AuthService } from '../../../../shared/auth/auth.service';
import { ANIMATION_MODULE_TYPE } from '@angular/core';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { Policies } from '../../interfaces/policies.interface';

describe('PoliciesComponent', () => {
  let component: PoliciesComponent;
  let fixture: ComponentFixture<PoliciesComponent>;
  let policiesServiceMock: any;
  let authServiceMock: any;

  const mockPolicies: Policies[] = [
    { id: '1', name: 'Geo Policy', type: 'Geofence', config: {}, weight: 25, isActive: true, createdById: 'u1', createdByUsername: 'admin', createdAt: new Date('2026-01-01') },
    { id: '2', name: 'Time Policy', type: 'Timewindow', config: {}, weight: 15, isActive: false, createdById: 'u1', createdByUsername: 'admin', createdAt: new Date('2026-01-01') },
  ];

  beforeEach(async () => {
    policiesServiceMock = {
      loadPolicies: vi.fn().mockReturnValue(of({ page: 1, pageSize: 20, totalRecords: 2, totalPages: 1, data: mockPolicies })),
      deletePolicies: vi.fn().mockReturnValue(of(true)),
    };

    authServiceMock = {
      isAdmin: true,
      isViewer: false,
    };

    await TestBed.configureTestingModule({
      imports: [PoliciesComponent],
      providers: [
        { provide: ANIMATION_MODULE_TYPE, useValue: 'NoopAnimations' },
        { provide: PoliciesService, useValue: policiesServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PoliciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. should create policies component', () => {
    expect(component).toBeTruthy();
  });

  it('2. should calculate activePolicies and inactivePolicies computed signals correctly', () => {
    component.data.set(mockPolicies);
    expect(component.activePolicies()).toBe(1);
    expect(component.inactivePolicies()).toBe(1);
  });

  it('3. should load policies on OnParamsGrid call with valid params', () => {
    component.OnParamsGrid({ page: 1, pageSize: 20 });
    expect(policiesServiceMock.loadPolicies).toHaveBeenCalled();
    expect(component.data()).toEqual(mockPolicies);
    expect(component.totalRecords()).toBe(2);
    expect(component.loading()).toBe(false);
  });

  it('4. should handle error when LoadPolicies fails', () => {
    const msgSpy = vi.spyOn((component as any).msg, 'add');
    policiesServiceMock.loadPolicies.mockReturnValue(throwError(() => ({ error: { message: 'Network error' } })));
    component.LoadPolicies();

    expect(component.loading()).toBe(false);
    expect(msgSpy).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Network error',
    });
  });

  it('5. should open create policy dialog and set selectedPolicy to null', () => {
    component.selectedPolicy.set(mockPolicies[0]);
    component.openCreate();

    expect(component.selectedPolicy()).toBeNull();
    expect(component.showActionDialog()).toBe(true);
    expect(component.isEditMode()).toBe(false);
  });

  it('6. should open edit policy dialog and set selectedPolicy', () => {
    component.openEdit(mockPolicies[0]);

    expect(component.selectedPolicy()).toEqual(mockPolicies[0]);
    expect(component.showActionDialog()).toBe(true);
    expect(component.isEditMode()).toBe(true);
  });

  it('7. should clear filters and reset typeSelected on limpiarFiltros', () => {
    component.typeSelected.set('Geofence');
    component.limpiarFiltros();

    expect(component.typeSelected()).toBe('');
    expect(component.filterParams()).toEqual({});
  });

  it('8. should build correct filterParams when typeSelected is set', () => {
    component.typeSelected.set('Timewindow');
    expect(component.filterParams()).toEqual({ type: 'Timewindow' });
  });

  it('9. should trigger delete confirmation and call deletePolicies service on accept', () => {
    const msgSpy = vi.spyOn((component as any).msg, 'add');
    const confirmSpy = vi.spyOn((component as any).confirmation, 'confirm').mockImplementation((options: any) => {
      options.accept();
      return (component as any).confirmation;
    });

    component.openDelete(mockPolicies[0]);

    expect(confirmSpy).toHaveBeenCalled();
    expect(policiesServiceMock.deletePolicies).toHaveBeenCalledWith('1');
    expect(msgSpy).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Eliminado',
      detail: 'Politica eliminada con exito',
    });
  });

  it('10. should reload policies on onPolicysaved call', () => {
    const spy = vi.spyOn(component, 'LoadPolicies');
    component.onPolicysaved();
    expect(spy).toHaveBeenCalled();
  });
});
