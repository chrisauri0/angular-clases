import { Routes } from '@angular/router';
import { Login } from './pages/auth/login/login';
import { Register } from './pages/auth/register/register';
import { Landing } from './pages/landing/landing';
import { MainLayout } from './components/layouts/main-layout/main-layout';
import { Home } from './pages/home/home/home';
import { Sidebar } from './components/sidebar/sidebar';
import { Usuarios } from './pages/usuarios/usuarios';
import { Grupos } from './pages/grupos/grupos';

export const routes: Routes = [
    {
    path: '',
    component: MainLayout,
    children: [
      { path: 'landing', component: Landing },
      { path: 'login', component: Login },
      { path: 'register', component: Register },
      
      { path: '', redirectTo: 'landing', pathMatch: 'full' }
    ]
    },
    {
    path: '',
    component: Sidebar,
    children: [
      {path: 'home', component: Home},
      {path: 'usuarios', component: Usuarios},
      {path: 'grupos', component: Grupos},

    ]
    
  }
];
