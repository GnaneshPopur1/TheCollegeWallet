import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BudgetService, Budget } from '../../core/services/budget.service';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './budgets.html',
  styleUrl: './budgets.scss'
})
export class Budgets implements OnInit {
  budgets: Budget[] = [];
  
  // Form fields
  newPeriod: string = 'WEEKLY';
  newLimit: number = 0;
  isSubmitting: boolean = false;

  constructor(private budgetService: BudgetService) {}

  ngOnInit() {
    this.fetchBudgets();
  }

  fetchBudgets() {
    this.budgetService.getBudgets().subscribe(data => {
      this.budgets = data || [];
    });
  }

  createBudget() {
    if (!this.newPeriod || this.newLimit <= 0) return;
    this.isSubmitting = true;
    this.budgetService.createBudget(this.newPeriod, this.newLimit).subscribe(res => {
      this.isSubmitting = false;
      if (res) {
        this.fetchBudgets();
        this.newLimit = 0; // reset
      }
    });
  }

  getProgressWidth(spent: number, limit: number): string {
    const percentage = (spent / limit) * 100;
    return `${Math.min(percentage, 100)}%`;
  }

  getProgressColor(spent: number, limit: number): string {
    const percentage = spent / limit;
    if (percentage > 0.9) return '#F44336'; // Red
    if (percentage > 0.75) return '#FF9800'; // Orange
    return '#4CAF50'; // Green
  }
}
