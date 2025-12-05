import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { RestaurantService } from '../../../core/services/restaurant.service';
import { ProductService } from '../../../core/services/product.service';
import { MenuService } from '../../../core/services/menu.service';
import { Restaurant } from '../../../core/models/restaurant.model';
import { Product } from '../../../core/models/product.model';
import { Menu } from '../../../core/models/menu.model';

interface MenuProductViewItem {
  id?: number;
  restaurant_id: number;
  product_id: number;
  name: string;
  description?: string;
  category?: string;
  price: number;
  availability: boolean;
}

@Component({
  standalone: true,
  selector: 'app-restaurant-menu',
  templateUrl: './restaurant-menu.component.html',
  imports: [CommonModule, FormsModule, HttpClientModule],
  providers: [RestaurantService, ProductService, MenuService],
})
export class RestaurantMenuComponent implements OnInit {
  restaurants: Restaurant[] = [];
  products: Product[] = [];
  menuProducts: MenuProductViewItem[] = [];

  selectedRestaurant = '';
  selectedProduct = '';
  price = '';

  loading = false;
  error: string | null = null;

  constructor(
    private restaurantService: RestaurantService,
    private productService: ProductService,
    private menuService: MenuService,
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  private async loadInitialData(): Promise<void> {
    try {
      const [restData, prodData] = await Promise.all([
        this.restaurantService.getAll().toPromise(),
        this.productService.getAll().toPromise(),
      ]);
      this.restaurants = restData ?? [];
      this.products = prodData ?? [];
    } catch (err) {
      console.error(err);
      this.error = 'Error cargando datos';
    }
  }

  async onRestaurantChange(restaurantId: string): Promise<void> {
    this.selectedRestaurant = restaurantId;
    if (!restaurantId) {
      this.menuProducts = [];
      return;
    }
    this.loading = true;
    try {
      const menuItems = await this.menuService.getAll().toPromise();
      const safeItems = Array.isArray(menuItems) ? menuItems : [];
      const filteredMenu = safeItems.filter(
        (item: Menu) => String(item.restaurant_id) === restaurantId,
      );
      const menuWithProduct: MenuProductViewItem[] = filteredMenu.map(
        (item: Menu) => {
          const prod = this.products.find((p) => p.id === item.product_id);
          return {
            id: item.id,
            restaurant_id: item.restaurant_id,
            product_id: item.product_id ?? 0,
            name: prod ? prod.name : '',
            description: prod?.description,
            category: prod?.category,
            price: item.price,
            availability: item.availability,
          };
        },
      );
      this.menuProducts = menuWithProduct;
    } catch (err) {
      console.error(err);
      this.menuProducts = [];
    } finally {
      this.loading = false;
    }
  }

  onProductChange(productId: string): void {
    this.selectedProduct = productId;
    if (productId) {
      const prod = this.products.find((p) => p.id === Number(productId));
      this.price = prod ? String(prod.price) : '';
    } else {
      this.price = '';
    }
  }

  addProductToMenu(): void {
    if (!this.selectedProduct || !this.price) return;
    const productObj = this.products.find(
      (p) => p.id === Number(this.selectedProduct),
    );
    if (!productObj || !this.selectedRestaurant) return;

    this.menuProducts = [
      ...this.menuProducts,
      {
        restaurant_id: Number(this.selectedRestaurant),
        product_id: productObj.id!,
        name: productObj.name,
        description: productObj.description,
        category: productObj.category,
        price: Number(this.price),
        availability: true,
      },
    ];

    this.selectedProduct = '';
    this.price = '';
  }

  async saveMenu(): Promise<void> {
    if (!this.selectedRestaurant || this.menuProducts.length === 0) return;
    this.loading = true;
    this.error = null;

    try {
      for (const prod of this.menuProducts) {
        if (prod.id) {
          await this.menuService
            .update(prod.id, {
              restaurant_id: Number(this.selectedRestaurant),
              product_id: prod.product_id,
              price: prod.price,
              availability: prod.availability,
            })
            .toPromise();
        } else {
          await this.menuService
            .create({
              restaurant_id: Number(this.selectedRestaurant),
              product_id: prod.product_id,
              price: prod.price,
              availability: true,
            })
            .toPromise();
        }
      }

      alert('Menú actualizado con éxito');
      await this.onRestaurantChange(this.selectedRestaurant);
    } catch (err: any) {
      console.error(err);
      this.error =
        'Error al crear o actualizar el menú: ' +
        (err?.error?.message || err.message || err);
    } finally {
      this.loading = false;
    }
  }

  removeProductFromMenu(idx: number): void {
    this.menuProducts = this.menuProducts.filter((_, i) => i !== idx);
  }

  editProduct(prod: MenuProductViewItem): void {
    this.selectedProduct = String(prod.product_id);
    this.price = String(prod.price);
  }
}
