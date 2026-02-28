import { Routes } from '@angular/router';
import { ButtonDemo } from './button-demo/button-demo';
import { Login } from './pages/auth/login/login';
import { Register } from './pages/auth/register/register';
import { Landing } from './pages/landing/landing';
import { MainLayout } from './components/layouts/main-layout/main-layout';
import { Home } from './pages/home/home/home';
import { Sidebar } from './components/sidebar/sidebar';

export const routes: Routes = [
    {
    path: '',
    component: MainLayout,
    children: [
      { path: 'landing', component: Landing },
      { path: 'login', component: Login },
      { path: 'register', component: Register },
      {path: 'home', component: Home},
      { path: '', redirectTo: 'landing', pathMatch: 'full' }
    ]
    },
    {
    path: '',
    component: Sidebar,
    children: [
      
    ]
    
  }
];
