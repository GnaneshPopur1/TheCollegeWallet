import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService, Account, Transaction } from '../../core/services/account.service';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PlaidService } from '../../core/services/plaid.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  accounts: Account[] = [];
  transactions: Transaction[] = [];
  netWorth: number = 0;
  roundUpBalance: number = 0;
  isSimulatingRoundUps: boolean = false;
  isEmailVerified: boolean = true;
  venmoHandle: string = '';
  isUpdatingVenmo: boolean = false;
  
  // Line chart properties for Net Worth
  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [650, 590, 800, 810, 850, 950, 1050],
        label: 'Net Worth',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: '#3b82f6',
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        fill: 'origin',
      }
    ],
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: { tension: 0.5 }
    },
    scales: {
      y: { display: false },
      x: { display: false }
    },
    plugins: {
      legend: { display: false }
    }
  };
  
  // Doughnut chart properties for Cash Flow / Budget
  public doughnutChartData: ChartData<'doughnut'> = {
    labels: ['Dining', 'Housing', 'Subscriptions', 'Other'],
    datasets: [
      { data: [350, 450, 100, 50], backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'] }
    ]
  };
  public doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'right', labels: { color: '#94a3b8'} } }
  };
  
  constructor(
    private accountService: AccountService,
    private authService: AuthService,
    private plaidService: PlaidService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.roundUpBalance = user.round_up_balance || 0;
        this.isEmailVerified = user.is_email_verified ?? true;
        this.venmoHandle = user.venmo_handle || '';
      }
    });

    this.fetchData();
  }

  simulateRoundUps() {
    this.isSimulatingRoundUps = true;
    this.accountService.simulateRoundUps().subscribe(res => {
      this.isSimulatingRoundUps = false;
      if (res && res.success) {
        this.authService.checkAuthStatus().subscribe(); // refresh balance
      }
    });
  }

  fetchData() {
    this.accountService.getAccounts().subscribe(data => {
      this.accounts = data || [];
      this.netWorth = this.accounts.reduce((acc, curr) => acc + curr.current_balance, 0);
      
      // For MVP, just grab transactions from the first account if it exists
      if (this.accounts.length > 0) {
        this.accountService.getTransactions(this.accounts[0].account_id).subscribe(tData => {
          this.transactions = tData || [];
        });
      }
    });
  }

  connectBank() {
    this.plaidService.openLink(() => {
      // Callback runs after successful link and sync
      console.log('Bank connected and synced!');
      this.fetchData();
    });
  }

  updateVenmo() {
    this.isUpdatingVenmo = true;
    this.authService.updateVenmoHandle(this.venmoHandle).subscribe(() => {
      this.isUpdatingVenmo = false;
    });
  }
}
