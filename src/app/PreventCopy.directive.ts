import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appPreventCopyPaste]'
})
export class PreventCopyDirective {

  @HostListener('contextmenu', ['$event'])
  disableRightClick(event: MouseEvent) {
    event.preventDefault();
    alert('Right-click is disabled to protect this content.');
  }

  @HostListener('copy', ['$event'])
  preventCopy(event: ClipboardEvent) {
    event.preventDefault();
    alert('Copying this content is not allowed.');
  }

  @HostListener('keydown', ['$event'])
  disableDevTools(event: KeyboardEvent) {
    // Disable F12, Ctrl+Shift+I (DevTools), and Print Screen
    if (event.key === 'F12' || ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'I')) {
      event.preventDefault();
      alert('DevTools are disabled.');
    }

    if (event.key === 'PrintScreen') {
      event.preventDefault();
      alert('Screenshots are disabled.');
    }
  }
}
