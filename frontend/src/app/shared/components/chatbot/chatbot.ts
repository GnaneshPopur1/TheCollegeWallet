import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrls: ['./chatbot.scss']
})
export class ChatbotComponent {
  isOpen = false;
  messages: ChatMessage[] = [];
  newMessage = '';
  isTyping = false;

  constructor(private http: HttpClient) {}

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.messages.length === 0) {
      this.messages.push({ sender: 'ai', text: 'Hi! I am your AI Financial Advisor. How can I help you save money today?' });
    }
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    const userText = this.newMessage;
    this.messages.push({ sender: 'user', text: userText });
    this.newMessage = '';
    this.isTyping = true;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post<{reply: string}>(`${environment.apiUrl}/chat`, { message: userText }, { headers }).subscribe(
      (res) => {
        this.isTyping = false;
        this.messages.push({ sender: 'ai', text: res.reply });
      },
      (err) => {
        this.isTyping = false;
        this.messages.push({ sender: 'ai', text: 'Sorry, I am having trouble connecting right now.' });
      }
    );
  }
}
