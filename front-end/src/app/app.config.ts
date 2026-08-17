import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { firstValueFrom } from 'rxjs';
import { routes } from './app.routes';
import { isAuthInterceptor } from './interceptors/interceptors/auth-interceptor';

// بيحدد فين ملفات الترجمة (json) هتتحمل منين
export function HttpLoaderFactory(http: HttpClient) {
  // لازم تكون الملفات في: public/assets/i18n/en.json و public/assets/i18n/ar.json
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// بينفذ قبل ما Angular يبدأ يرسم أي كومبوننت في الصفحة (bootstrap)
// بيستنى ملف الترجمة يوصل فعليًا من السيرفر قبل ما أي حاجة تترسم،
// فمفيش أي احتمال إن الـ | translate pipe يترسم أول مرة قبل ما البيانات توصل
// (وده كان سبب مشكلة المفاتيح اللي بتظهر خام زي nav.register / common.search)
export function initTranslation(translate: TranslateService) {
  return () => {
    const savedLang = (localStorage.getItem('lang') as 'en' | 'ar') || 'en';
    translate.setDefaultLang('en');

    // firstValueFrom بتخلي الـ initializer يستنى فعليًا لحد ما الـ HTTP request يخلص
    return firstValueFrom(translate.use(savedLang)).then(() => {
      // بمجرد ما الترجمة تجهز، اضبط اتجاه ولغة الصفحة قبل أول render
      document.documentElement.lang = savedLang;
      document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
    });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([isAuthInterceptor])),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'en', // اللغة الافتراضية (fallback لو مفتاح ناقص)
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      })
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: initTranslation,
      deps: [TranslateService],
      multi: true,
    },
  ]
};