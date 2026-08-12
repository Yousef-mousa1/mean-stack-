import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../service/auth';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  email = '';
  password = '';

  constructor(
    private auth: Auth,
    private router: Router
  ) {}


  login() {

    const data = {
      email: this.email,
      password: this.password,
    };


    this.auth.login(data).subscribe({

      next: (res:any)=>{

        console.log(res);

        this.auth.setSession(res.token, res.user);

        if(res.user.role === 'admin'){
          this.router.navigate(['/admin-dashboard']);
        }
        else{
          // العميل العادي بيروح على الصفحة الرئيسية مباشرة بعد تسجيل الدخول
          this.router.navigate(['/']);
        }

      },


      error:(err)=>{

        console.log(err);
        alert('Invalid email or password');

      }

    });

  }

}