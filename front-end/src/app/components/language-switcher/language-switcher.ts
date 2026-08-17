import { Component } from '@angular/core';
import { LanguageService } from '../../service/language.service';
@Component({
  selector: 'app-language-switcher',
  standalone: true,
  template: `
    <button
      (click)="langService.toggleLanguage()"
      class="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
    >
      {{ langService.currentLang() === 'en' ? 'AR' : 'EN' }}
    </button>
  `,
})
export class LanguageSwitcherComponent {
  constructor(public langService: LanguageService) {}
}