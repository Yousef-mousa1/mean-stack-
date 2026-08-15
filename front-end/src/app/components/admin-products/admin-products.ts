import { environment } from '../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../service/products';
import { CategoriesService } from '../../service/categories';
import { Iproduct } from '../../model/iproduct';
import { Icategory } from '../../model/icategory';
import { AdminNav } from '../admin-nav/admin-nav';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNav],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.css',
})
export class AdminProducts implements OnInit {

  products: Iproduct[] = [];
  categories: Icategory[] = [];

  searchTerm: string = '';
  selectedCategoryFilter: string = '';

  isLoading: boolean = false;

  // Modal state
  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  formData: any = {};

  private searchTimeout: any;

  private readonly backendUrl = environment.backendUrl;

  constructor(
    private ProductsService: ProductsService,
    private categoriesService: CategoriesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.categoriesService.getAll().subscribe({
      next: (res: any) => {
        this.categories = res?.data || res?.categories || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      },
    });
  }

  loadProducts(): void {
    this.isLoading = true;

    this.ProductsService
      .getAll({
        search: this.searchTerm || undefined,
        category: this.selectedCategoryFilter || undefined,
      })
      .subscribe({
        next: (res) => {
          this.products = res?.data || [];
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading products:', err);
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  // بيستدعي البحث بعد ما المستخدم يوقف عن الكتابة بـ 400ms (debounce بسيط)
  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.loadProducts();
    }, 400);
  }

  onCategoryFilterChange(): void {
    this.loadProducts();
  }

  // ===== Image handling =====

  getImageUrl(image: string | undefined | null): string {
    if (!image) return 'https://via.placeholder.com/48?text=No+Image';
    if (image.startsWith('http')) return image;
    return `${this.backendUrl}${image}`;
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/48?text=No+Image';
  }

  // ===== Add / Edit Modal =====

  openAddModal(): void {
    this.isEditMode = false;
    this.formData = {
      name: '',
      brand: '',
      price: null,
      oldPrice: null,
      image: '',
      unit: '',
      stock: 100,
      isAvailable: true,
      category: '',
    };
    this.isModalOpen = true;
  }

  openEditModal(product: Iproduct): void {
    this.isEditMode = true;
    this.formData = {
      ...product,
      category: (product as any).category?._id || (product as any).category || '',
    };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.formData = {};
  }

  saveProduct(): void {
    if (!this.formData.name || this.formData.price === null || this.formData.price === undefined) {
      alert('Name and price are required.');
      return;
    }

    const payload = { ...this.formData };
    if (!payload.category) delete payload.category;

    if (this.isEditMode) {
      this.ProductsService.update(this.formData._id, payload).subscribe({
        next: () => {
          this.closeModal();
          this.loadProducts();
        },
        error: (err) => {
          console.error('Error updating product:', err);
          alert('Failed to update product.');
        },
      });
    } else {
      this.ProductsService.create(payload).subscribe({
        next: () => {
          this.closeModal();
          this.loadProducts();
        },
        error: (err) => {
          console.error('Error creating product:', err);
          alert('Failed to create product.');
        },
      });
    }
  }

  deleteProduct(id: string): void {
    if (!confirm('Are you sure you want to delete this product?')) return;

    this.ProductsService.delete(id).subscribe({
      next: () => {
        this.products = this.products.filter((p) => p._id !== id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error deleting product:', err);
        alert('Failed to delete product.');
      },
    });
  }
}