import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Motorcycle } from '../../../../core/models/motorcycle.model';

const statuses = ['open', 'pending', 'resolved', 'closed'];
const issueTypes = ['maintenance', 'incident', 'other'];

export interface IssueFormData {
  motorcycle_id: string | number;
  description: string;
  issue_type: string;
  date_reported: string;
  status: string;
}

@Component({
  standalone: true,
  selector: 'app-admin-issue-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './issue-form.component.html',
})
export class IssueFormComponent {
  @Input() motorcycles: Motorcycle[] = [];
  @Output() submitIssue = new EventEmitter<IssueFormData>();
  @Output() cancel = new EventEmitter<void>();

  statuses = statuses;
  issueTypes = issueTypes;

  form: IssueFormData = {
    motorcycle_id: '',
    description: '',
    issue_type: issueTypes[0],
    date_reported: new Date().toISOString().slice(0, 16),
    status: statuses[0],
  };

  submit(): void {
    this.submitIssue.emit(this.form);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
