import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

    setCookie(name: string, value: string, hours: number) {
        const date = new Date();
        date.setTime(date.getTime() + (hours * 60 * 60 * 1000));  // Duración de la cookie en horas
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value};${expires};path=/;Secure`;
    }

    getCookie(name: string): string | null {
        if (typeof document !== 'undefined') {
            const nameEQ = name + "=";
            const ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i].trim();
                if (c.indexOf(nameEQ) === 0) {
                    return c.substring(nameEQ.length, c.length);
                }
            }
        }
        return null;
    }

    clearCookie(name: string) {
        this.setCookie(name, '', -1); 
    }

    isLoggedIn(): boolean {
        return this.getCookie('authToken') !== null;
    }
}