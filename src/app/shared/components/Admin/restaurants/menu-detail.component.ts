import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MenuService } from '../../../../core/services/menu.service';
import { ProductService } from '../../../../core/services/product.service';
import { Menu } from '../../../../core/models/menu.model';
import { Product } from '../../../../core/models/product.model';

interface MenuProductItem extends Menu {
  name: string;
  description: string | null;
  category: string | null;
}

@Component({
  standalone: true,
  selector: 'app-admin-menu-detail',
  imports: [CommonModule],
  templateUrl: './menu-detail.component.html',
})
export class MenuDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private menuService = inject(MenuService);
  private productService = inject(ProductService);

  restaurantId!: string;
  productos: MenuProductItem[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.restaurantId = String(this.route.snapshot.paramMap.get('id') ?? '');
    this.loadData();
  }

  private loadData(): void {
    this.loading = true;
    this.error = null;

    this.menuService.getAll().subscribe({
      next: menus => {
        this.productService.getAll().subscribe({
          next: products => {
            const menuItems = menus.filter(
              item => String(item.restaurant_id) === this.restaurantId
            );

            this.productos = menuItems.map(item => {
              const prod = (products as Product[]).find(
                p => p.id === item.product_id
              );
              return {
                ...item,
                name: prod ? prod.name : '',
                description: prod?.description ?? null,
                category: (prod as any)?.category ?? null,
              };
            });
            this.loading = false;
          },
          error: () => {
            this.error = 'Error al cargar los productos del menú.';
            this.loading = false;
          },
        });
      },
      error: () => {
        this.error = 'Error al cargar los productos del menú.';
        this.loading = false;
      },
    });
  }
}
