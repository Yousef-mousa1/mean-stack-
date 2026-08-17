import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  // بيحمل اللغة الحالية، أي component يقدر يقرأه ويعمل عليه reactive update
  currentLang = signal<'en' | 'ar'>('en');

  constructor(private translate: TranslateService) {
    // ملحوظة مهمة: اللغة الأولية بقت بتتحمّل من APP_INITIALIZER في app.config.ts
    // قبل ما التطبيق يبدأ يرسم أي حاجة أصلاً (عشان نحل مشكلة الـ race condition)
    // فهنا بس بنزامن الـ signal + الـ dir/lang مع اللغة اللي already اتحملت،
    // من غير ما ننادي translate.use() تاني (عشان منعملش الشغل مرتين).
    const savedLang = (localStorage.getItem('lang') as 'en' | 'ar') || 'en';
    this.currentLang.set(savedLang);
    document.documentElement.lang = savedLang;
    document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
  }

  setLanguage(lang: 'en' | 'ar') {
    this.translate.use(lang);
    this.currentLang.set(lang);
    localStorage.setItem('lang', lang);

    // أهم سطر: بيغيّر اتجاه الصفحة كلها (RTL/LTR) واللغة في الـ <html> tag
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  toggleLanguage() {
    const next = this.currentLang() === 'en' ? 'ar' : 'en';
    this.setLanguage(next);
  }
}