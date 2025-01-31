import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appPreventCopy]'
})
export class PreventCopyDirective {

  @HostListener('copy', ['$event'])
  blockCopy(event: ClipboardEvent): void {
    event.preventDefault();
    alert('Copying is disabled on this site.');
  }

  @HostListener('cut', ['$event'])
  blockCut(event: ClipboardEvent): void {
    event.preventDefault();
    alert('Cutting is disabled on this site.');
  }

  @HostListener('paste', ['$event'])
  blockPaste(event: ClipboardEvent): void {
    event.preventDefault();
    alert('Pasting is disabled on this site.');
  }

  @HostListener('contextmenu', ['$event'])
  blockRightClick(event: MouseEvent): void {
    event.preventDefault();
    alert('Right-click is disabled.');
  }
}
