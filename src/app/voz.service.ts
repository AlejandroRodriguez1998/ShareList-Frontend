import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class VozService {
  recognition: any = null;
  isStoppedSpeechRecog = false;
  tempWords: string = '';
  campoActual: string = ''; // Campo actual que se está rellenando
  callback: (campo: string, valor: string) => void = () => {}; // Callback para asignar valores

  constructor(private toastr: ToastrService) {}

  private initializeRecognition() {
    if (!this.recognition && typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.recognition.lang = 'es-ES';
      this.recognition.interimResults = false;
    } else if (!this.recognition) {
      this.toastr.error('El navegador no soporta el reconocimiento de voz.', 'Error');
    }
  }

  init(campo: string, callback: (campo: string, valor: string) => void) {
    this.initializeRecognition();
    this.campoActual = campo;
    this.callback = callback;

    if (this.recognition) {
      this.recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        this.callback(this.campoActual, transcript);
        this.stop();
      };

      this.recognition.onerror = (event: any) => {
        this.toastr.error('Error en el reconocimiento de voz. Intente de nuevo.', 'Error');
        console.error(event);
      };
    }
  }

  start() {
    this.initializeRecognition();
    if (this.recognition) {
      this.isStoppedSpeechRecog = false;
      this.recognition.start();
      this.toastr.info('Hable ahora para rellenar el campo.', 'Reconocimiento de voz');
    } else {
      this.toastr.error('El reconocimiento de voz no está inicializado.', 'Error');
    }
  }

  stop() {
    if (this.recognition) {
      this.isStoppedSpeechRecog = true;
      this.recognition.stop();
      this.toastr.info('Reconocimiento de voz detenido.', 'Información');
    }
  }

  speakWithCallback(text: string, onComplete: () => void) {
    if ('speechSynthesis' in window) {
  
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
    
      // Detectar el final de la lectura
      utterance.onend = () => {
        if (onComplete) {
          onComplete(); // Llamar al callback proporcionado
        }
      };
    
      speechSynthesis.speak(utterance);
    
    } else {
      this.toastr.error('El navegador no soporta la síntesis de voz.', 'Error');
    }
  }
}
