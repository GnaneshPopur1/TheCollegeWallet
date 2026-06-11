import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionService, AppSubscription } from '../../core/services/subscription.service';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscriptions.html',
  styleUrl: './subscriptions.scss'
})
export class Subscriptions implements OnInit {
  subscriptions: AppSubscription[] = [];
  monthlyTotal: number = 0;
  isScanning: boolean = false;

  constructor(private subService: SubscriptionService) {}

  ngOnInit() {
    this.fetchSubscriptions();
  }

  fetchSubscriptions() {
    this.subService.getSubscriptions().subscribe(data => {
      this.subscriptions = data || [];
      this.calculateTotal();
    });
  }

  calculateTotal() {
    this.monthlyTotal = this.subscriptions
      .filter(s => s.status === 'ACTIVE')
      .reduce((acc, curr) => acc + curr.amount, 0);
  }

  scanFootprint() {
    this.isScanning = true;
    this.subService.scanFootprint().subscribe(res => {
      this.isScanning = false;
      if (res && res.subscriptions) {
        this.fetchSubscriptions();
      }
    });
  }

  cancelSub(id: string) {
    this.subService.cancelSubscription(id).subscribe(() => {
      const sub = this.subscriptions.find(s => s.subscription_id === id);
      if (sub) {
        sub.status = 'CANCELLED';
        this.calculateTotal();
      }
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
