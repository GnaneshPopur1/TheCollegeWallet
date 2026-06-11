import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AcademicsService, AcademicTerm } from '../../core/services/academics.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-education-hub',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './education-hub.html',
  styleUrl: './education-hub.scss'
})
export class EducationHub implements OnInit {
  currentTerm: AcademicTerm | null = null;
  diningData: { safe_daily_spend: number, days_remaining: number, dining_dollars: number } | null = null;
  
  tuitionPaidPercent: number = 0;
  diningDailyBudget: number = 0;

  isCreatingTerm = false;
  isUpdatingDining = false;
  
  // Penn State Berks Presets
  campusPresets = [
    { id: 'custom', name: 'Custom Setup' },
    { 
      id: 'berks_fall_2026', 
      name: 'Penn State Berks - Fall 2026',
      semester_name: 'Fall 2026',
      end_date: '2026-12-18',
      tuition_total: 8000
    }
  ];

  mealPlanTiers = [
    { id: 'custom', name: 'Custom Amount', amount: null },
    { id: 'commuter', name: 'Commuter Plan ($500)', amount: 500 },
    { id: 'level1', name: 'Resident Level 1 ($2,100)', amount: 2100 },
    { id: 'level2', name: 'Resident Level 2 ($2,400)', amount: 2400 },
    { id: 'level3', name: 'Resident Level 3 ($2,600)', amount: 2600 }
  ];

  selectedPreset = 'custom';
  selectedMealPlan = 'custom';

  termForm: FormGroup;
  diningForm: FormGroup;

  constructor(
    private academicsService: AcademicsService,
    private fb: FormBuilder
  ) {
    this.termForm = this.fb.group({
      semester_name: ['', Validators.required],
      tuition_total: ['', [Validators.required, Validators.min(0)]],
      aid_applied: ['', [Validators.required, Validators.min(0)]],
      dining_dollars_bal: ['', [Validators.required, Validators.min(0)]],
      end_date: ['', Validators.required]
    });

    this.diningForm = this.fb.group({
      new_balance: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.academicsService.getTermData().subscribe(term => {
      // API returns empty object if no term found, check if term_id exists
      this.currentTerm = term && term.term_id ? term : null;
      this.calculateMetrics();
    });

    this.academicsService.getDiningData().subscribe(data => {
      this.diningData = data;
    });
  }

  calculateMetrics() {
    if (!this.currentTerm) return;
    this.tuitionPaidPercent = Math.round((this.currentTerm.aid_applied / this.currentTerm.tuition_total) * 100);
  }

  toggleCreateTerm() {
    this.isCreatingTerm = !this.isCreatingTerm;
    if (!this.isCreatingTerm) {
      this.termForm.reset();
      this.selectedPreset = 'custom';
      this.selectedMealPlan = 'custom';
    }
  }

  onPresetChange(event: any) {
    const presetId = event.target.value;
    this.selectedPreset = presetId;
    
    if (presetId === 'berks_fall_2026') {
      const preset = this.campusPresets.find(p => p.id === presetId);
      if (preset) {
        this.termForm.patchValue({
          semester_name: preset.semester_name,
          end_date: preset.end_date,
          tuition_total: preset.tuition_total
        });
      }
    }
  }

  onMealPlanChange(event: any) {
    const planId = event.target.value;
    this.selectedMealPlan = planId;
    
    if (planId !== 'custom') {
      const plan = this.mealPlanTiers.find(p => p.id === planId);
      if (plan) {
        this.termForm.patchValue({
          dining_dollars_bal: plan.amount
        });
      }
    }
  }

  toggleUpdateDining() {
    this.isUpdatingDining = !this.isUpdatingDining;
    if (!this.isUpdatingDining) this.diningForm.reset();
  }

  submitTerm() {
    if (this.termForm.valid) {
      this.academicsService.createTerm(this.termForm.value).subscribe(() => {
        this.isCreatingTerm = false;
        this.termForm.reset();
        this.loadData();
      });
    }
  }

  submitDiningUpdate() {
    if (this.diningForm.valid && this.currentTerm) {
      this.academicsService.updateDiningBalance(this.currentTerm.term_id, this.diningForm.value.new_balance).subscribe(() => {
        this.isUpdatingDining = false;
        this.diningForm.reset();
        this.loadData();
      });
    }
  }
}
