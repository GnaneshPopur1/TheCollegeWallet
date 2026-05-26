import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountService, Transaction } from '../../core/services/account.service';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscriptions.html',
  styleUrl: './subscriptions.scss'
})
export class Subscriptions implements OnInit {
  subscriptions: Transaction[] = [];
  monthlyTotal: number = 0;

  constructor(private accountService: AccountService) {}

  ngOnInit() {
    this.accountService.getSubscriptions().subscribe(data => {
      this.subscriptions = data || [];
      // Calculate total assuming all are monthly for MVP
      this.monthlyTotal = this.subscriptions.reduce((acc, curr) => acc + (curr.amount < 0 ? curr.amount * -1 : curr.amount), 0);
    });
  }

  getInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  getRandomColor(name: string): string {
    const colors = ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }
}
