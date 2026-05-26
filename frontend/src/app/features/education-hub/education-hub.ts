import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AcademicsService, AcademicTerm } from '../../core/services/academics.service';

@Component({
  selector: 'app-education-hub',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './education-hub.html',
  styleUrl: './education-hub.scss'
})
export class EducationHub implements OnInit {
  currentTerm: AcademicTerm | null = null;
  diningData: { safe_daily_spend: number, days_remaining: number, dining_dollars: number } | null = null;
  
  tuitionPaidPercent: number = 0;
  diningDailyBudget: number = 0;

  constructor(private academicsService: AcademicsService) {}

  ngOnInit() {
    this.academicsService.getTermData().subscribe(term => {
      this.currentTerm = term;
      this.calculateMetrics();
    });

    this.academicsService.getDiningData().subscribe(data => {
      this.diningData = data;
    });
  }

  calculateMetrics() {
    if (!this.currentTerm) return;
    
    // Example metrics calculations
    this.tuitionPaidPercent = Math.round((this.currentTerm.aid_applied / this.currentTerm.tuition_total) * 100);
    
    // Assume 60 days left in semester for mock daily budget
    const daysLeftInSemester = 60;
    this.diningDailyBudget = this.currentTerm.dining_dollars_bal / daysLeftInSemester;
  }
}
