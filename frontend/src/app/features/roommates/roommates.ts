import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoommateService, GroupData, SharedExpense } from '../../core/services/roommate.service';
import { ChatService, ChatMessage } from '../../core/services/chat.service';

@Component({
  selector: 'app-roommates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roommates.html',
  styleUrl: './roommates.scss',
})
export class Roommates implements OnInit {
  groupData: GroupData | null = null;
  expenses: SharedExpense[] = [];
  isLoading = false;

  // New Expense form
  showAddExpenseModal = false;
  newExpenseAmount: number | null = null;
  newExpenseDescription = '';
  isAddingExpense = false;

  // Chat
  messages: ChatMessage[] = [];
  newMessageText = '';
  chatInterval: any;

  constructor(
    private roommateService: RoommateService,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    if (this.chatInterval) {
      clearInterval(this.chatInterval);
    }
  }

  loadData() {
    this.isLoading = true;
    this.roommateService.getGroupData().subscribe(data => {
      this.groupData = data;
      
      this.roommateService.getRecentExpenses().subscribe(expenses => {
        this.expenses = expenses;
        this.isLoading = false;

        // Start chat polling if in a group
        if (this.groupData?.group && !this.chatInterval) {
          this.loadMessages();
          this.chatInterval = setInterval(() => {
            this.loadMessages();
          }, 3000);
        }
      });
    });
  }

  loadMessages() {
    if (!this.groupData?.group) return;
    this.chatService.getMessages(this.groupData.group.group_id).subscribe(msgs => {
      this.messages = msgs;
    });
  }

  sendMessage() {
    if (!this.newMessageText.trim() || !this.groupData?.group) return;
    const text = this.newMessageText;
    this.newMessageText = ''; // clear immediately for UX
    this.chatService.sendMessage(this.groupData.group.group_id, text).subscribe(msg => {
      if (msg) this.messages.push(msg);
    });
  }

  openAddExpense() {
    this.showAddExpenseModal = true;
  }

  closeAddExpense() {
    this.showAddExpenseModal = false;
    this.newExpenseAmount = null;
    this.newExpenseDescription = '';
  }

  submitExpense() {
    if (!this.newExpenseAmount || !this.newExpenseDescription) return;
    this.isAddingExpense = true;

    this.roommateService.addExpense(this.newExpenseAmount, this.newExpenseDescription).subscribe(() => {
      this.isAddingExpense = false;
      this.closeAddExpense();
      this.loadData();
    });
  }

  settleUp(splitId: string) {
    if (confirm('Are you sure you want to mark this split as settled?')) {
      this.roommateService.settleSplit(splitId).subscribe(() => {
        this.loadData();
      });
    }
  }
}
