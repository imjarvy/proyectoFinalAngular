import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DriverService } from '../../../core/services/driver.service';
import { Driver, DriverCreatePayload } from '../../../core/models/driver.model';
import { Subject, takeUntil } from 'rxjs';
import { MotorcycleService } from '../../../core/services/motorcycle.service';

@Component({
  standalone: true,
  selector: 'app-conductores-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class ConductoresFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private driverService = inject(DriverService);
  private motorcycleService = inject(MotorcycleService);
  private destroy$ = new Subject<void>();

  id: number | null = null;
  loading = false;
  error: string | null = null;
  motosDisponibles: { id: number; license_plate: string }[] = [];

  form: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    cedula: ['', [Validators.required, Validators.pattern(/^[0-9]{6,12}$/)]],
    telefono: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s-]{7,15}$/)]],
    licencia: this.fb.group({
      numero: ['', Validators.required],
      tipo: ['', Validators.required],
      vencimiento: ['', Validators.required],
    }),
    estado: ['activo'],
    motoId: [null],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : null;
    if (this.id) this.load();
    this.loadMotosDisponibles();
  }

  private load(): void {
    this.loading = true;
    this.driverService
      .getById(this.id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (d: Driver) => {
          this.form.patchValue({
            nombre: d.nombre,
            cedula: d.cedula,
            telefono: d.telefono,
            licencia: {
              numero: d.licencia.numero,
              tipo: d.licencia.tipo,
              vencimiento: (d.licencia.vencimiento as any) ?? '',
            },
            estado: d.estado,
            motoId: d.motoId ?? null,
          });
          this.loading = false;
        },
        error: () => {
          this.error = 'No se pudo cargar el conductor';
          this.loading = false;
        },
      });
  }

  private loadMotosDisponibles(): void {
    this.motorcycleService
      .getAvailable()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (list: any) => {
          this.motosDisponibles = list;
        },
        error: () => {
          // Silencioso para no bloquear el formulario si el endpoint no existe
          this.motosDisponibles = [];
        },
      });
  }

  private validateFechaVencimiento(): boolean {
    const venc = this.form.get('licencia.vencimiento')!.value;
    const date = new Date(venc);
    const today = new Date();
    return date.getTime() > today.getTime();
  }

  onSubmit(): void {
    if (!this.form.valid || !this.validateFechaVencimiento()) {
      this.form.markAllAsTouched();
      if (!this.validateFechaVencimiento()) this.error = 'La fecha de vencimiento debe ser futura';
      return;
    }
    this.loading = true;
    this.error = null;
    const raw = this.form.value as any;
    const payload: DriverCreatePayload = {
      nombre: raw.nombre,
      cedula: raw.cedula,
      telefono: raw.telefono,
      licencia: raw.licencia,
      estado: raw.estado,
      motoId: raw.motoId == null || raw.motoId === '' ? undefined : Number(raw.motoId),
    } as DriverCreatePayload;

    const req$ = this.id
      ? this.driverService.update(this.id, payload)
      : this.driverService.create(payload);

    req$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        alert('Conductor guardado');
        this.router.navigate(['/dashboard/admin/conductores']);
      },
      error: () => {
        this.loading = false;
        this.error = 'No se pudo guardar el conductor';
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
