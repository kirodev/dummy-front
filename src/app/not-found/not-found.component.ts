import { Component, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent implements OnInit, AfterViewInit {

  constructor() { }

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
        background.innerHTML += square.outerHTML;
      }
    }
  }

  activeSquare(event: MouseEvent): void {
    if (event.target instanceof HTMLElement) {
      if (event.target.classList.contains('active')) {
        event.target.classList.remove("active");
      } else {
        event.target.classList.add("active");
      }
    }
  }
}
