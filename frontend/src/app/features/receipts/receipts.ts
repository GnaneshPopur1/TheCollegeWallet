import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReceiptService, ScanResult } from '../../core/services/receipt.service';
import { RoommateService } from '../../core/services/roommate.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-receipts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receipts.html',
  styleUrl: './receipts.scss',
})
export class Receipts {
  isScanning = false;
  isSplitting = false;
  scanResult: ScanResult | null = null;
  selectedFileName = '';

  constructor(
    private receiptService: ReceiptService,
    private roommateService: RoommateService,
    private router: Router
  ) {}

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFileName = file.name;
      this.scanFile(file);
    }
  }

  scanFile(file: File) {
    this.isScanning = true;
    this.scanResult = null;
    
    this.receiptService.scanReceipt(file).subscribe(result => {
      this.isScanning = false;
      if (result) {
        this.scanResult = result;
      }
    });
  }

  resetScan() {
    this.scanResult = null;
    this.selectedFileName = '';
  }

  splitWithRoommates() {
    if (!this.scanResult || !this.scanResult.total) return;
    this.isSplitting = true;
    
    const desc = `${this.scanResult.storeName || 'Receipt'} (${this.scanResult.date || 'Auto-scan'})`;
    
    this.roommateService.addExpense(this.scanResult.total, desc).subscribe(res => {
      this.isSplitting = false;
      if (res) {
        this.router.navigate(['/roommates']);
      }
    });
  }
}
