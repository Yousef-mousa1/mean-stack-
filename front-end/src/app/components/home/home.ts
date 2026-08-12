import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  heroImage = 'assets/log1.jpg';
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

  // ملحوظة: أسماء الكاتيجوريز دي لازم تتطابق تمامًا (بعد الـ normalize) مع
  // أسماء الـ Categories الموجودة في الباك اند، وإلا الفلترة بالكاتيجوري مش هتشتغل.
  categories = [
    { name: 'Bakery', image: 'assets/bakery.jpeg' },
    { name: 'Dairy & Eggs', image: 'assets/d&epng.png' },
    { name: 'Meat & Seafood', image: 'assets/m&s.jpeg' },
    { name: 'Fruits & Vegetables', image: 'assets/f&v.png' },
    { name: 'Frozen', image: 'assets/frozen.png' },
    { name: 'Beverages', image: 'assets/drinks.png' },
    { name: 'Snacks', image: 'assets/snacks.png' },
    { name: 'Pantry & Grocery', image: 'assets/p&g.jpeg' },
    { name: 'Household', image: 'assets/hh.jpeg' },
    { name: 'Personal Care', image: 'assets/pc.jpeg' }
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