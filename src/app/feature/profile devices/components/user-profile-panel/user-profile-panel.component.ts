import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import QRCode from 'qrcode';

import { UserService } from '../../services/users.services';
import {
  UserProfileDto,
  MfaStatusDto,
  VerdictType,
} from '../../interfaces/user-profile.interface';
import { ProfileDevices } from '../../interfaces/profile-devices.interface';

@Component({
  selector: 'app-user-profile-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    DecimalPipe,
    ButtonModule,
    TableModule,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-confirmDialog></p-confirmDialog>
    <p-dialog
      [header]="'Perfil & Accesos - ' + (user()?.username || '')"
      [visible]="visible()"
      (visibleChange)="visibleChange.emit($event)"
      [modal]="true"
      [style]="{ width: '850px' }"
      (onShow)="onShow()"
    >
      <div class="space-y-6 pt-2">
        @if (loading()) {
          <div class="p-6 text-center text-slate-400">Cargando datos del perfil...</div>
        } @else if (profile(); as p) {
          <!-- Header de Perfil y Widget MFA -->
          <div class="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-800 gap-4">
            <div>
              <h3 class="text-lg font-bold text-white">{{ p.username }}</h3>
              <p class="text-xs text-slate-400 font-mono">ID: {{ p.userId }}</p>
            </div>

            <!-- Widget MFA -->
            @if (mfaStatus(); as mfa) {
              <div class="flex items-center gap-3">
                @if (mfa.mfaEnabled) {
                  <span class="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                    MFA Activo
                  </span>
                  <p-button
                    label="Resetear MFA"
                    icon="pi pi-refresh"
                    severity="danger"
                    [outlined]="true"
                    size="small"
                    (onClick)="handleResetMfa()"
                  ></p-button>
                } @else {
                  <span class="px-3 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    MFA Inactivo
                  </span>
                  <p-button
                    label="Enrolar y Activar TOTP"
                    icon="pi pi-shield"
                    severity="info"
                    size="small"
                    (onClick)="handleBeginEnroll()"
                  ></p-button>
                }
              </div>
            }
          </div>

          <!-- SECCIÓN 1: Tarjeta "Perfil en Construcción" 🛠️ vs Vector Entrenado -->
          @if (p.isColdStart || !p.featureVector) {
            <div class="p-5 rounded-lg bg-amber-950/20 border border-amber-500/30 flex items-start gap-4">
              <div class="text-3xl">🛠️</div>
              <div>
                <h4 class="text-base font-semibold text-amber-300">Perfil en construcción</h4>
                <p class="text-sm text-amber-200/70 mt-1">
                  Este usuario está en período de arranque en frío (Cold-Start). No posee suficiente historial de accesos para calcular el vector de características.
                </p>
                <div class="mt-3 flex gap-4 text-xs text-amber-300/90 font-mono">
                  <span>Penalización base: +{{ p.baseRiskPenalty }} risk score</span>
                  <span>Accesos acumulados: {{ p.accessCount }}</span>
                </div>
              </div>
            </div>
          } @else {
            <!-- Vector Entrenado -->
            <div class="p-4 bg-slate-900 rounded-lg border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span class="text-xs text-slate-400 block">Hora Habitual</span>
                <p class="text-base font-medium text-white">{{ p.featureVector.typicalHour | number:'1.1-1' }} hrs</p>
              </div>
              <div>
                <span class="text-xs text-slate-400 block">Frecuencia</span>
                <p class="text-base font-medium text-white">{{ p.featureVector.frequency * 100 | number:'1.1-1' }}%</p>
              </div>
              <div>
                <span class="text-xs text-slate-400 block">Diversidad de IP</span>
                <p class="text-base font-medium text-white">{{ p.featureVector.diversity * 100 | number:'1.1-1' }}%</p>
              </div>
              <div>
                <span class="text-xs text-slate-400 block">Último Entrenamiento</span>
                <p class="text-base font-medium text-white">
                  {{ p.lastTrainedAt ? (p.lastTrainedAt | date:'short') : 'N/A' }}
                </p>
              </div>
            </div>
          }

          <!-- SECCIÓN 2: Tabla de Accesos Recientes (Audit Logs) -->
          <div class="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
            <div class="px-4 py-3 border-b border-slate-800 flex justify-between items-center">
              <h4 class="text-sm font-semibold text-slate-200">Últimos Accesos (Audit Logs)</h4>
              <span class="text-xs text-slate-400 font-mono">Total: {{ p.recentAccesses.length }}</span>
            </div>

            <p-table [value]="p.recentAccesses" styleClass="p-datatable-sm">
              <ng-template pTemplate="header">
                <tr class="bg-slate-950 text-xs uppercase text-slate-400">
                  <th>Fecha / Hora</th>
                  <th>Veredicto</th>
                  <th>Risk Score</th>
                  <th>IP Origen</th>
                  <th>Ubicación</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-access>
                <tr class="hover:bg-slate-800/30 transition-colors text-sm text-slate-300">
                  <td class="font-mono text-xs text-slate-400">
                    {{ access.evaluatedAt | date:'short' }}
                  </td>
                  <td>
                    <span
                      class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                      [ngClass]="getVerdictBadgeClass(access.verdict)"
                    >
                      {{ access.verdict }}
                    </span>
                  </td>
                  <td class="font-semibold font-mono">
                    {{ access.riskScore | number:'1.2-2' }}
                  </td>
                  <td class="font-mono text-xs text-slate-300">
                    {{ access.sourceIp }}
                  </td>
                  <td class="text-xs text-slate-400">
                    {{ access.city ? access.city + ', ' : '' }}{{ access.country || 'Desconocida' }}
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="5" class="text-center py-6 text-slate-500">
                    No se registran accesos recientes.
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </div>
        }
      </div>
    </p-dialog>

    <!-- Modal Enrolamiento y Activación MFA -->
    <p-dialog
      header="Activar MFA con Authenticator"
      [(visible)]="mfaModalVisible"
      [modal]="true"
      [style]="{ width: '480px' }"
    >
      @if (provisioningUri(); as uri) {
        <div class="space-y-4 pt-2">
          <p class="text-xs text-slate-400">
            Escanea el código QR desde tu aplicación autenticadora (Google Authenticator / Authy / 1Password) o ingresa la clave secreta manualmente.
          </p>

          <!-- Advertencia de Clave Nueva -->
          <div class="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-xs leading-relaxed flex gap-2 items-start">
            <i class="pi pi-exclamation-triangle text-amber-400 text-sm mt-0.5 shrink-0"></i>
            <div>
              <strong>¡Importante!</strong> Si ya tenías guardada una clave previa en tu Authenticator, <u>elimínala primero</u>. Cada intento de enrolamiento genera un nuevo secreto y los códigos de la clave anterior serán rechazados.
            </div>
          </div>

          <!-- Código QR Generado Localmente -->
          <div class="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-slate-700">
            @if (qrCodeDataUrl(); as qrUrl) {
              <img
                [src]="qrUrl"
                alt="QR Code MFA"
                class="w-52 h-52 object-contain"
              />
            } @else {
              <img
                [src]="getQrCodeUrl(uri)"
                (error)="handleQrError($event, uri)"
                alt="QR Code MFA"
                class="w-52 h-52 object-contain"
              />
            }
          </div>

          <!-- Clave Secreta para Configuración Manual -->
          @if (extractedSecret) {
            <div class="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1.5">
              <div class="flex items-center justify-between text-xs text-slate-400">
                <span class="font-medium text-slate-300">Clave Secreta (Ingreso Manual):</span>
                <button
                  type="button"
                  (click)="copySecret()"
                  class="text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1 text-xs font-semibold"
                >
                  <i class="pi pi-copy text-xs"></i>
                  Copiar Clave
                </button>
              </div>
              <div class="font-mono text-sm tracking-wider text-sky-300 font-bold bg-slate-950 px-3 py-2 rounded border border-slate-800 text-center select-all break-all">
                {{ formattedSecret }}
              </div>
            </div>
          }

          <!-- Desplegable de Verificación Técnica de URI -->
          <details class="text-[11px] text-slate-500 font-mono">
            <summary class="cursor-pointer hover:text-slate-400 transition-colors select-none">
              Ver URI TOTP generado por el servidor
            </summary>
            <div class="p-2 bg-slate-950 rounded border border-slate-800 break-all mt-1 select-all text-[10px] text-slate-400">
              {{ provisioningUri() }}
            </div>
          </details>

          <div class="space-y-2 pt-1 border-t border-slate-800">
            <label class="block text-xs font-medium text-slate-300">
              Ingresa el código OTP de 6 dígitos generado por tu aplicación para activar:
            </label>
            <input
              type="text"
              maxlength="6"
              [(ngModel)]="otpCode"
              placeholder="000000"
              class="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded font-mono text-xl text-center tracking-widest focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <p-button
              label="Cancelar"
              severity="secondary"
              (onClick)="mfaModalVisible.set(false)"
            ></p-button>
            <p-button
              label="Confirmar y Activar MFA"
              severity="success"
              [loading]="mfaSubmitting()"
              [disabled]="otpCode().length !== 6"
              (onClick)="handleConfirmEnroll()"
            ></p-button>
          </div>
        </div>
      }
    </p-dialog>
  `,
})
export class UserProfilePanelComponent {
  private readonly userService = inject(UserService);
  private readonly msg = inject(MessageService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);

  visible = input<boolean>(false);
  visibleChange = output<boolean>();
  user = input<ProfileDevices | null>(null);

  profile = signal<UserProfileDto | null>(null);
  mfaStatus = signal<MfaStatusDto | null>(null);
  loading = signal<boolean>(true);

  provisioningUri = signal<string | null>(null);
  qrCodeDataUrl = signal<string | null>(null);
  otpCode = signal<string>('');
  mfaSubmitting = signal<boolean>(false);
  mfaModalVisible = signal<boolean>(false);

  encodeUri(uri: string): string {
    return encodeURIComponent(uri);
  }

  getQrCodeUrl(uri: string): string {
    return `https://quickchart.io/qr?size=300&margin=2&ecLevel=M&text=${encodeURIComponent(uri)}`;
  }

  handleQrError(event: Event, uri: string): void {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement && !imgElement.dataset['fallback']) {
      imgElement.dataset['fallback'] = 'true';
      imgElement.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=2&ecc=M&data=${encodeURIComponent(uri)}`;
    }
  }

  get extractedSecret(): string {
    const uri = this.provisioningUri();
    if (!uri) return '';
    const match = uri.match(/[?&]secret=([^&]+)/i);
    return match ? match[1] : '';
  }

  get formattedSecret(): string {
    const s = this.extractedSecret;
    if (!s) return '';
    return s.replace(/(.{4})/g, '$1 ').trim();
  }

  copySecret(): void {
    const secret = this.extractedSecret;
    if (!secret) return;
    navigator.clipboard.writeText(secret).then(() => {
      this.msg.add({
        severity: 'info',
        summary: 'Copiado',
        detail: 'Clave secreta copiada al portapapeles.',
      });
    });
  }

  onShow(): void {
    const u = this.user();
    if (!u) return;

    this.loading.set(true);
    this.userService
      .getUserProfile(u.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.profile.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.msg.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.error?.message || 'Error al cargar perfil de usuario.',
          });
        },
      });

    this.userService
      .getMfaStatus(u.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.mfaStatus.set(data),
        error: () => {},
      });
  }

  handleBeginEnroll(): void {
    const u = this.user();
    if (!u) return;

    this.loading.set(true);
    // Ejecutar primero resetMfa para limpiar cualquier secret previo en el backend
    this.userService
      .resetMfa(u.id)
      .pipe(
        catchError(() => of(null)), // Si no tenía MFA enrolado o falla el reset, continuar con el enrolamiento
        switchMap(() => this.userService.enrollMfa(u.id)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          this.provisioningUri.set(res.provisioningUri);
          
          if (res.provisioningUri) {
            QRCode.toDataURL(res.provisioningUri, { width: 300, margin: 2, errorCorrectionLevel: 'M' })
              .then((url: string) => this.qrCodeDataUrl.set(url))
              .catch(() => this.qrCodeDataUrl.set(null));
          }

          this.mfaModalVisible.set(true);
        },
        error: (err) => {
          this.loading.set(false);
          this.msg.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.error?.message || 'Error al iniciar enrolamiento TOTP.',
          });
        },
      });
  }

  handleConfirmEnroll(): void {
    const u = this.user();
    const otp = this.otpCode().replace(/\D/g, '');
    if (!u || otp.length !== 6) return;

    this.mfaSubmitting.set(true);
    this.userService
      .confirmMfaEnrollment(u.id, otp)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedStatus) => {
          this.mfaSubmitting.set(false);
          this.mfaStatus.set(updatedStatus);
          this.mfaModalVisible.set(false);
          this.otpCode.set('');
          this.provisioningUri.set(null);
          this.msg.add({
            severity: 'success',
            summary: 'MFA Activado',
            detail: 'El segundo factor TOTP ha sido activado exitosamente.',
          });
        },
        error: (err) => {
          this.mfaSubmitting.set(false);
          this.msg.add({
            severity: 'error',
            summary: 'Código Inválido (MFA_INVALID)',
            detail: err?.error?.message || 'El código OTP expiró o no coincide. Asegúrate de escanear la clave actual y sincronizar la hora de tu teléfono.',
          });
        },
      });
  }

  handleResetMfa(): void {
    const u = this.user();
    if (!u) return;

    this.confirmation.confirm({
      header: 'Resetear Segundo Factor (MFA)',
      message: '¿Está seguro de desactivar el MFA para esta cuenta?',
      icon: 'pi pi-exclamation-triangle text-rose-500',
      acceptLabel: 'Resetear MFA',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.userService
          .resetMfa(u.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (updatedStatus) => {
              this.mfaStatus.set(updatedStatus);
              this.msg.add({
                severity: 'info',
                summary: 'MFA Desactivado',
                detail: 'Se ha reseteado el segundo factor para el usuario.',
              });
            },
            error: (err) => {
              this.msg.add({
                severity: 'error',
                summary: 'Error',
                detail: err?.error?.message || 'Error al resetear MFA.',
              });
            },
          });
      },
    });
  }

  getVerdictBadgeClass(verdict: VerdictType): string {
    switch (verdict) {
      case 'Allow':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Challenge':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Block':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  }
}
