import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DriverService } from '../../core/services/driver.service';
import { MotorcycleService } from '../../core/services/motorcycle.service';
import { Motorcycle } from '../../core/models/motorcycle.model';

@Component({
  standalone: true,
  selector: 'app-driver-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './driver-form.component.html',
  styleUrl: './driver-form.component.scss',
})
export class DriverFormComponent {
  private fb = inject(FormBuilder);
  private driverService = inject(DriverService);
  private motorcycleService = inject(MotorcycleService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  motos: Motorcycle[] = [];
  loading = true;
  error: string | null = null;

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    telefono: ['', [Validators.required, Validators.pattern(/^[0-9\-\s]+$/)]],
    licenciaNumero: ['', [Validators.required]],
    motoId: [null as number | null, [Validators.required]],
  });

  ngOnInit() {
    this.motorcycleService.getAll().subscribe({
      next: (motos) => { this.motos = motos; this.loading = false; },
      error: () => { this.error = 'No se pudieron cargar las motos'; this.loading = false; }
    });

    const id = Number(this.route.snapshot.queryParamMap.get('id'));
    if (Number.isFinite(id) && id > 0) {
      this.driverService.getById(id).subscribe({
        next: (d) => {
          this.form.patchValue({
            nombre: d.nombre,
            telefono: d.telefono,
            licenciaNumero: d.licencia?.numero || '',
            motoId: d.motoId ?? null,
          });
        },
        error: () => {}
      });
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    const payload = {
      nombre: v.nombre!,
      telefono: v.telefono!,
      licencia: { numero: v.licenciaNumero!, tipo: 'A', vencimiento: new Date().toISOString() },
      motoId: Number(v.motoId!),
      cedula: 'N/A',
    };
    const id = Number(this.route.snapshot.queryParamMap.get('id'));
    const request$ = (Number.isFinite(id) && id > 0)
      ? this.driverService.update(id, payload as any)
      : this.driverService.create(payload as any);

    request$.subscribe({
      next: () => this.router.navigate(['dashboard/driver/drivers']),
      error: () => this.error = 'No se pudo guardar el conductor'
    });
  }
}
