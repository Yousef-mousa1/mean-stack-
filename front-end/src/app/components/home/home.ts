import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CategoriesService } from '../../service/categories';
import { Icategory } from '../../model/icategory';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  heroImage = 'assets/log1.jpg';

  // بيتملى من الـ API بدل ما يكون array ثابت، عشان أي فئة جديدة تظهر تلقائيًا
  categories = signal<Icategory[]>([]);

  // صورة افتراضية عامة لو الفئة اسمها جديد كليًا ومفيش ليها صورة في الداتابيز ولا في المابينج تحت
  private readonly fallbackImage = 'assets/hh.jpeg';

  // مابينج محلي بالصور القديمة، بيشتغل بس كـ fallback للفئات اللي متسجلتش لها صورة في الداتابيز
  // المفاتيح هنا لازم تكون بدون رموز أو مسافات، بنفس طريقة التطبيع في getCategoryImage تحت
  private readonly categoryImageMap: Record<string, string> = {
    'bakery': 'assets/bakery.jpeg',
    'dairyeggs': 'assets/d&epng.png',
    'meatseafood': 'assets/m&s.jpeg',
    'fruitsvegetables': 'assets/f&v.png',
    'frozen': 'assets/frozen.png',
    'beverages': 'assets/drinks.png',
    'snacks': 'assets/snacks.png',
    'pantrygrocery': 'assets/p&g.jpeg',
    'household': 'assets/hh.jpeg',
    'personalcare': 'assets/pc.jpeg',
  };

  constructor(private categoriesService: CategoriesService) {}

  ngOnInit() {
    this.fetchCategories();
  }

  fetchCategories() {
    this.categoriesService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.categories.set(res.data);
        }
      },
      error: (err) => {
        console.error('Fetch categories error:', err);
      },
    });
  }

  // بترجع صورة الفئة: من الداتابيز الأول، وإلا من المابينج المحلي بالاسم، وإلا صورة عامة افتراضية
  getCategoryImage(category: Icategory): string {
    if (category.image) return category.image;

    const normalizedName = category.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return this.categoryImageMap[normalizedName] || this.fallbackImage;
  }

  flipCard(card: any) {
    card.flipped = !card.flipped;
  }

  cards = [
    {
      image: 'assets/ab.jpeg',
      title: '5 Creative Ways to Use Almond Butter',
      author: 'Chef Yousef',
      date: 'Sep 25, 2025',
      preview:
        'Discover delicious and healthy ways to enjoy almond butter in your breakfast, snacks, desserts, and everyday meals.',
      description:
        'Almond butter is rich in protein, healthy fats, vitamin E and antioxidants. It supports heart health, keeps you full longer and is perfect for toast, smoothies and healthy desserts.',
      features: [
        'High in Protein',
        'Heart Friendly',
        'Rich in Vitamin E',
        'Perfect for Healthy Snacks'
      ],
      flipped: false
    },

    {
      image: 'assets/ff.jpeg',
      title: 'Fresh Fruits Every Morning',
      author: 'Chef Emma',
      date: 'Sep 26, 2025',
      preview:
        'Fresh fruits are the perfect choice to start your day with energy.',
      description:
        'Seasonal fruits are packed with vitamins, minerals and antioxidants that improve your health every day.',
      features: [
        'Rich in Fiber',
        'Natural Vitamins',
        'Boosts Immunity',
        'Low Calories'
      ],
      flipped: false
    },

    {
      image: 'assets/hb.jpeg',
      title: 'Healthy Breakfast Ideas',
      author: 'Chef John',
      date: 'Sep 27, 2025',
      preview:
        'Healthy breakfast recipes to keep you active all day long.',
      description:
        'A balanced breakfast improves concentration, increases energy and supports a healthy lifestyle.',
      features: [
        'Quick Recipes',
        'High Energy',
        'Balanced Nutrition',
        'Easy To Make'
      ],
      flipped: false
    }
  ];

  features = [
    {
      icon: '💎',
      title: 'Premium Quality',
      description: 'We source only the best materials.'
    },
    {
      icon: '🚚',
      title: 'Fast Shipping',
      description: 'Get your orders delivered promptly.'
    },
    {
      icon: '🎧',
      title: '24/7 Support',
      description: 'Our support team is always here.'
    }
  ];
}