import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../service/auth';
@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './rigister.html',
  styleUrl: './rigister.css',
})
export class Register {

  registerForm!: FormGroup;

  constructor(
    private auth: Auth,
    private fb: FormBuilder,
    private router: Router
  ) {

    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

  }

  register() {
      console.log("Register button clicked");

    this.auth.register(this.registerForm.value).subscribe({

      next: (res: any) => {

        console.log(res);

        // بدل ما نودّي على login مباشرة، نودّي على صفحة تأكيد الـ OTP
        // ونمرّرله id اليوزر اللي اتسجل عشان يستخدمه في التأكيد
        this.router.navigate(['/verify-otp', res.user._id]);

      },

      error: (err: any) => {

        console.log(err);

        alert('Register Failed');

      },

      complete: () => {

        console.log('Register Completed');

      }

    });

  }

}