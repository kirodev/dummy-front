import { Component, AfterViewInit, NgZone, Renderer2, ElementRef } from '@angular/core';

@Component({
  selector: 'app-sechome',
  templateUrl: './sechome.component.html',
  styleUrls: ['./sechome.component.css']
})
export class SechomeComponent implements AfterViewInit {

  constructor(
    private ngZone: NgZone,
    private renderer: Renderer2,
    private elRef: ElementRef
  ) {}

  ngAfterViewInit(): void {
    // Use NgZone to ensure the background is initialized after the view is fully rendered
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.initializeBackground();
      }, 0);
    });
  }

  initializeBackground(): void {
    const square = this.elRef.nativeElement.querySelector('.Square') as HTMLElement;
    const background = this.elRef.nativeElement.querySelector('#Background') as HTMLElement;

    if (square && background) {
      const windowWidth = window.innerWidth || document.documentElement.clientWidth;
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const squareCount = Math.ceil((windowWidth / square.clientWidth) * (windowHeight / square.clientHeight));

      // Clear previous squares to prevent duplicate content on reinitialization
      while (background.firstChild) {
        background.removeChild(background.firstChild);
      }

      // Create squares and append to background using Renderer2
      for (let i = 0; i < squareCount; i++) {
        const newSquare = this.renderer.createElement('div');
        this.renderer.addClass(newSquare, 'Square');
        this.renderer.appendChild(background, newSquare);
      }
    }
  }

  activeSquare(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target && target.classList.contains('Square')) {
      // Toggle class using Renderer2 for better security
      if (target.classList.contains('active')) {
        this.renderer.removeClass(target, 'active');
      } else {
        this.renderer.addClass(target, 'active');
      }
    }
  }
}
