import { Component } from '@angular/core';
import { MatDialogRef } from "@angular/material/dialog";
import { ModalComponent } from "../modal/modal.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatIcon } from "@angular/material/icon";

@Component({
    selector: 'app-open-file',
    templateUrl: './open-file.component.html',
    styleUrls: ['./open-file.component.scss'],
    imports: [ModalComponent, MatIcon]
})
export class OpenFileComponent {
  dragging = false;

  constructor(
    private dialogRef: MatDialogRef<OpenFileComponent>,
    private snackBar: MatSnackBar,
  ) {}

  readText(event: Event) {
    const input = event.target as HTMLInputElement;
    this.handle(input.files?.item(0) ?? null);
    input.value = '';
  }

  onDrag(e: DragEvent, over: boolean) {
    e.preventDefault();
    this.dragging = over;
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.dragging = false;
    this.handle(e.dataTransfer?.files?.item(0) ?? null);
  }

  /** Valida pelo conteúdo: o MIME type de .json costuma vir vazio no Windows/Linux. */
  private async handle(file: File | null) {
    if (!file) return;
    try {
      const text = await file.text();
      JSON.parse(text);
      this.snackBar.open(`Arquivo ${file.name} aberto`, 'OK', { duration: 3000 });
      this.dialogRef.close(text);
    } catch {
      this.snackBar.open(`O arquivo ${file.name} não é um JSON válido.`, 'Fechar', { duration: 4000 });
    }
  }
}
