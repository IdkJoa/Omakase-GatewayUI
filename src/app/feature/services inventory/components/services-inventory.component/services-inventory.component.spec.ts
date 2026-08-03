import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServicesInventoryComponent } from './services-inventory.component';
import { ServiceProtectedService } from '../../services/ServicesProtected.services';
import { AuthService } from '../../../../shared/auth/auth.service';
import { ANIMATION_MODULE_TYPE } from '@angular/core';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { Services } from '../../interfaces/services-protected.interface';

describe('ServicesInventoryComponent', () => {
  let component: ServicesInventoryComponent;
  let fixture: ComponentFixture<ServicesInventoryComponent>;
  let serviceProtectedMock: any;
  let authServiceMock: any;

  const mockServices: Services[] = [
    {
      id: 's-1',
      name: 'Auth Gateway',
      upstreamUrl: 'https://auth.gateway.com',
      requiresAuth: true,
      isActive: true,
      createdAt: new Date('2026-01-01'),
      associatedPoliciesCount: 2
    }
  ];

  beforeEach(async () => {
    serviceProtectedMock = {
      loadServices: vi.fn().mockReturnValue(of({ data: mockServices, totalRecords: 1, page: 1, pageSize: 20, totalPages: 1 })),
      deleteServices: vi.fn().mockReturnValue(of({ data: mockServices, totalRecords: 0, page: 1, pageSize: 20, totalPages: 0 })),
    };

    authServiceMock = {
      isAdmin: true,
      isViewer: false,
    };

    await TestBed.configureTestingModule({
      imports: [ServicesInventoryComponent],
      providers: [
        { provide: ANIMATION_MODULE_TYPE, useValue: 'NoopAnimations' },
        { provide: ServiceProtectedService, useValue: serviceProtectedMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ServicesInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. should create services inventory component', () => {
    expect(component).toBeTruthy();
  });

  it('2. should format status labels correctly using FormattedStatus', () => {
    expect(component.FormattedStatus(true, 'status')).toBe('Activo');
    expect(component.FormattedStatus(false, 'status')).toBe('Inactivo');
    expect(component.FormattedStatus(true, 'other')).toBe('Requerido');
    expect(component.FormattedStatus(false, 'other')).toBe('No requerido');
  });

  it('3. should load services on OnparamsGrid call with valid params', () => {
    component.OnparamsGrid({ page: 1, pageSize: 20 });

    expect(serviceProtectedMock.loadServices).toHaveBeenCalled();
    expect(component.data()).toEqual(mockServices);
    expect(component.totalRecords()).toBe(1);
    expect(component.loading()).toBe(false);
  });

  it('4. should handle error when loadServices fails', () => {
    const msgSpy = vi.spyOn((component as any).msg, 'add');
    serviceProtectedMock.loadServices.mockReturnValue(throwError(() => ({ error: { message: 'Fetch error' } })));
    component.loadServices();

    expect(component.loading()).toBe(false);
    expect(msgSpy).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Fetch error',
    });
  });

  it('5. should open create dialog and set selectedServices to null', () => {
    component.selectedServices.set(mockServices[0]);
    component.openCreate();

    expect(component.selectedServices()).toBeNull();
    expect(component.showActionDialog()).toBe(true);
    expect(component.isEditMode()).toBe(false);
  });

  it('6. should open edit dialog with selected service', () => {
    component.openEdit(mockServices[0]);

    expect(component.selectedServices()).toEqual(mockServices[0]);
    expect(component.showActionDialog()).toBe(true);
    expect(component.isEditMode()).toBe(true);
  });

  it('7. should open policy dialog with selected service', () => {
    component.openPolicies(mockServices[0]);

    expect(component.selectedServices()).toEqual(mockServices[0]);
    expect(component.showPolicyDialog()).toBe(true);
  });

  it('8. should clear filters and reset typeSelected on limpiarFiltros', () => {
    component.typeSelected.set('true');
    component.limpiarFiltros();

    expect(component.typeSelected()).toBe('');
    expect(component.filterParams()).toEqual({});
  });

  it('9. should build correct filterParams based on typeSelected value', () => {
    component.typeSelected.set('true');
    expect(component.filterParams()).toEqual({ isActive: true });

    component.typeSelected.set('false');
    expect(component.filterParams()).toEqual({ isActive: false });
  });

  it('10. should trigger confirmation dialog and delete service on accept', () => {
    const msgSpy = vi.spyOn((component as any).msg, 'add');
    const confirmSpy = vi.spyOn((component as any).confirmation, 'confirm').mockImplementation((opt: any) => {
      opt.accept();
      return (component as any).confirmation;
    });

    component.openDelete(mockServices[0]);

    expect(confirmSpy).toHaveBeenCalled();
    expect(serviceProtectedMock.deleteServices).toHaveBeenCalledWith('s-1');
    expect(msgSpy).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Eliminado',
      detail: 'Servicio eliminado con exito',
    });
  });
});
