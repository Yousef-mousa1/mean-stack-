import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriesService } from '../../service/categories';
import { Icategory } from '../../model/icategory';

@Component({
  selector: 'app-admin-categories',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-categories.html',
  styleUrl: './admin-categories.css',
})
export class AdminCategories implements OnInit {
  categories = signal<Icategory[]>([]);
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  // لو null يبقى وضع "إضافة"، لو فيه id يبقى وضع "تعديل"
  editingId: string | null = null;

  form = {
    name: '',
    slug: '',
    description: '',
    image: '',
  };

  constructor(private categoriesService: CategoriesService) {}

  ngOnInit() {
    this.fetchCategories();
  }

  fetchCategories() {
    this.loading.set(true);
    this.categoriesService.getAll().subscribe({
      next: (result) => {
        if (result.success) {
          this.categories.set(result.data);
        } else {
          this.errorMessage.set('حصلت مشكلة في جلب الفئات');
        }
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('مقدرناش نجيب الفئات');
        this.loading.set(false);
      },
    });
  }

  submit() {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!this.form.name || !this.form.slug) {
      this.errorMessage.set('اسم الفئة والـ slug مطلوبين');
      return;
    }

    if (this.editingId) {
      this.categoriesService.update(this.editingId, this.form).subscribe({
        next: () => {
          this.successMessage.set('اتحدثت الفئة بنجاح');
          this.resetForm();
          this.fetchCategories();
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'حصلت مشكلة في التحديث');
        },
      });
    } else {
      this.categoriesService.create(this.form).subscribe({
        next: () => {
          this.successMessage.set('اتضافت الفئة بنجاح');
          this.resetForm();
          this.fetchCategories();
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'حصلت مشكلة في الإضافة');
        },
      });
    }
  }

  startEdit(category: Icategory) {
    this.editingId = category._id;
    this.form = {
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image: category.image || '',
    };
  }

  cancelEdit() {
    this.resetForm();
  }

  deleteCategory(categoryId: string) {
    if (!confirm('متأكد إنك عايز تمسح الفئة دي؟')) return;

    this.categoriesService.delete(categoryId).subscribe({
      next: () => this.fetchCategories(),
      error: (err) => {
        // الباك إند بيرفض المسح لو فيه منتجات مرتبطة بالفئة، وبيرجع رسالة توضح كده
        this.errorMessage.set(err.error?.message || 'مقدرناش نمسح الفئة');
      },
    });
  }

  resetForm() {
    this.editingId = null;
    this.form = { name: '', slug: '', description: '', image: '' };
  }
}