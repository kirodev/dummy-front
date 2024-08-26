import { Component, AfterViewInit, NgZone } from '@angular/core';

@Component({
  selector: 'app-sechome',
  templateUrl: './sechome.component.html',
  styleUrls: ['./sechome.component.css']
})
export class SechomeComponent implements AfterViewInit {
  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    // Use NgZone to ensure the background is initialized after the view is fully rendered
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.initializeBackground();
      }, 0);
    });
  }

  initializeBackground(): void {
    const square = document.querySelector(".Square") as HTMLElement;
    const background = document.getElementById("Background");
    if (square && background) {
      const windowWidth = window.innerWidth || document.documentElement.clientWidth;
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const squareLen = Math.ceil((windowWidth / square.clientWidth) * (windowHeight / square.clientHeight));

      let squares = '';
      for (let i = 0; i < squareLen; i++) {
        squares += square.outerHTML;
      }
      background.innerHTML = squares;
    }
  }

  activeSquare(event: MouseEvent): void {
    if (event.target instanceof HTMLElement) {
      event.target.classList.toggle("active");
    }
  }
}
