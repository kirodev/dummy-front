import { Component, OnInit, AfterViewInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent implements OnInit, AfterViewInit {

  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initializeBackground();
  }

  initializeBackground(): void {
    const square = document.querySelector(".Square") as HTMLElement;
    const background = document.getElementById("Background");
    if (square && background) {
      const squareLen = (window.outerWidth / square.clientWidth) * (window.outerHeight / square.clientHeight);

      for (let i = 0; i <= squareLen; i++) {
        // Clone the square element
        const squareClone = square.cloneNode(true) as HTMLElement;
        // Append the cloned element to the background using Renderer2
        this.renderer.appendChild(background, squareClone);
      }
    }
  }

  activeSquare(event: MouseEvent): void {
    if (event.target instanceof HTMLElement) {
      if (event.target.classList.contains('active')) {
        this.renderer.removeClass(event.target, 'active');
      } else {
        this.renderer.addClass(event.target, 'active');
      }
    }
  }
}
