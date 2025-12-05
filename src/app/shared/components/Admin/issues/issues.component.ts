import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IssueService, Issue, IssueCreatePayload } from '../../../../core/services/issue.service';
import { MotorcycleService } from '../../../../core/services/motorcycle.service';
import { Motorcycle } from '../../../../core/models/motorcycle.model';
import { IssueFormComponent, IssueFormData } from './issue-form.component';

const statusOptions = ['open', 'pending', 'resolved', 'closed'];

@Component({
  standalone: true,
  selector: 'app-admin-issues',
  imports: [CommonModule, FormsModule, IssueFormComponent],
  templateUrl: './issues.component.html',
})
export class IssuesComponent implements OnInit {
  private issueService = inject(IssueService);
  private motorcycleService = inject(MotorcycleService);

  issues: Issue[] = [];
  motorcycles: Motorcycle[] = [];
  showForm = false;
  statusOptions = statusOptions;

  ngOnInit(): void {
    this.issueService.getAll().subscribe(issues => (this.issues = issues));
    this.motorcycleService.getAll().subscribe(motos => (this.motorcycles = motos));
  }

  handleCreate(): void {
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
  }

  handleFormSubmit(formData: IssueFormData): void {
    const payload: IssueCreatePayload = {
      motorcycle_id: Number(formData.motorcycle_id),
      description: formData.description,
      issue_type: formData.issue_type,
      date_reported: formData.date_reported,
      status: formData.status,
    };

    this.issueService.create(payload).subscribe(newIssue => {
      this.issues = [...this.issues, newIssue];
      this.showForm = false;
    });
  }

  handleStatusChange(id: number, newStatus: string): void {
    this.issueService.updateStatus(id, newStatus).subscribe(() => {
      this.issues = this.issues.map(issue =>
        issue.id === id ? { ...issue, status: newStatus } : issue
      );
    });
  }

  findMotorcycle(motorcycleId: number): Motorcycle | undefined {
    return this.motorcycles.find(m => m.id === motorcycleId);
  }
}
