import { environment } from '../../../environments/environment';
import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { OrdersService } from '../../service/Orders.service';
import { Iorder } from '../../model/iorder';

@Component({
  selector: 'app-my-orders',
  imports: [DatePipe],
  templateUrl: './my-orders.component.html',
  styleUrl: './my-orders.component.css',
})
export class MyOrdersComponent implements OnInit {
  orders = signal<Iorder[]>([]);
  loading = signal(false);
  errorMessage = signal('');

  // بيتخزن فيه الـ id بتاع الأوردر اللي بيتلغي دلوقتي، عشان نعطل زراره بس هو
  cancellingOrderId = signal<string | null>(null);

  private readonly backendUrl = environment.backendUrl;

  constructor(private ordersService: OrdersService) {}

  ngOnInit() {
    this.fetchOrders();
  }

  fetchOrders() {
    this.loading.set(true);
    this.errorMessage.set('');

    this.ordersService.getMyOrders().subscribe({
      next: (res) => {
        this.orders.set(res.orders);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Fetch orders error:', err);
        if (err.status === 401) {
          this.errorMessage.set('لازم تسجّل الدخول الأول عشان تشوف أوردراتك');
        } else {
          this.errorMessage.set('حصلت مشكلة في جلب الأوردرات');
        }
        this.loading.set(false);
      },
    });
  }

  // بيلغي الأوردر (بس لو لسه Pending، الباك اند بيتأكد برضو)
  cancelOrder(orderId: string) {
    const confirmed = confirm('متأكد إنك عايز تلغي الأوردر ده؟');
    if (!confirmed) return;

    this.cancellingOrderId.set(orderId);

    this.ordersService.cancelOrder(orderId).subscribe({
      next: (res) => {
        // نحدث حالة الأوردر ده بس في الـ list المحلية، من غير ما نعمل fetch جديد
        this.orders.update((list) =>
          list.map((o) => (o._id === orderId ? { ...o, status: 'Cancelled' } : o))
        );
        this.cancellingOrderId.set(null);
      },
      error: (err) => {
        console.error('Cancel order error:', err);
        const msg = err?.error?.message || 'حصلت مشكلة في إلغاء الأوردر';
        alert(msg);
        this.cancellingOrderId.set(null);
      },
    });
  }

  getImageUrl(image: string | undefined | null): string {
    if (!image) return 'https://via.placeholder.com/80?text=No+Image';
    if (image.startsWith('http')) return image;
    return `${this.backendUrl}${image}`;
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/80?text=No+Image';
  }

  // بترجع كلاس تلوين مختلف حسب حالة الأوردر
  statusClass(status: string): string {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Processing':
        return 'bg-blue-100 text-blue-700';
      case 'Delivered':
        return 'bg-green-100 text-green-700';
      case 'Cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  // بترجع النص العربي المقابل لحالة الأوردر
  statusLabel(status: string): string {
    switch (status) {
      case 'Pending':
        return 'قيد الانتظار';
      case 'Processing':
        return 'بيتجهّز';
      case 'Delivered':
        return 'وصل';
      case 'Cancelled':
        return 'اتلغى';
      default:
        return status;
    }
  }
}