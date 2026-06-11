import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoommateService, GroupData, SharedExpense } from '../../core/services/roommate.service';
import { AccountService } from '../../core/services/account.service';

@Component({
  selector: 'app-fixed-costs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fixed-costs.html',
  styleUrl: './fixed-costs.scss'
})
export class FixedCosts implements OnInit {
  groupData: GroupData | null = null;
  recentExpenses: SharedExpense[] = [];
  
  newExpenseAmount: number | null = null;
  newExpenseDesc: string = '';
  isSubmittingExpense: boolean = false;
  isScanning: boolean = false;
  
  constructor(private roommateService: RoommateService, private accountService: AccountService) {}

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.roommateService.getGroupData().subscribe(data => {
      this.groupData = data;
    });

    this.roommateService.getRecentExpenses().subscribe(expenses => {
      this.recentExpenses = expenses;
    });
  }

  settleUp(splitId: string) {
    this.roommateService.settleSplit(splitId).subscribe(() => {
      // Reload data to reflect settled balance
      this.fetchData();
    });
  }

  submitNewExpense() {
    if (!this.newExpenseAmount || !this.newExpenseDesc) return;
    
    this.isSubmittingExpense = true;
    this.roommateService.addExpense(this.newExpenseAmount, this.newExpenseDesc).subscribe(() => {
      this.isSubmittingExpense = false;
      this.newExpenseAmount = null;
      this.newExpenseDesc = '';
      this.fetchData(); // Refresh the ledger
    }, error => {
      this.isSubmittingExpense = false;
      console.error('Failed to add expense', error);
    });
  }

  onReceiptSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.isScanning = true;
      this.accountService.scanReceipt(file).subscribe(
        (response) => {
          this.isScanning = false;
          if (response?.success && response.extractedTotal) {
            this.newExpenseAmount = response.extractedTotal;
            this.newExpenseDesc = 'Scanned Receipt';
          } else {
            alert('Could not detect a total amount. Please enter it manually.');
          }
        },
        (error) => {
          this.isScanning = false;
          alert('Failed to scan receipt image.');
        }
      );
    }
  }
}
