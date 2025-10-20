import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

interface DirectoryMember {
  id: number;
  name: string;
}

interface CommitteeMember extends DirectoryMember {
  endorsed: boolean;
  doa: string;
}

@Component({
  selector: 'app-manage-bidders-dialog',
  templateUrl: './manage-bidders-dialog.component.html',
  styleUrls: ['./manage-bidders-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ManageBiddersDialogComponent {
  private readonly directory: DirectoryMember[] = [
    { id: 1, name: 'Amelia Grant' },
    { id: 2, name: 'Benjamin Ortiz' },
    { id: 3, name: 'Chloe Laurent' },
    { id: 4, name: 'Dmitri Ivanov' },
    { id: 5, name: 'Elena García' },
    { id: 6, name: 'Fatima Zahra' },
    { id: 7, name: 'George Anderson' },
    { id: 8, name: 'Haruto Sato' },
    { id: 9, name: 'Isabella Ferrari' },
    { id: 10, name: 'James Wilson' },
  ];

  committeeMembers: CommitteeMember[] = [
    { id: 2, name: 'Benjamin Ortiz', endorsed: true, doa: '' },
    { id: 5, name: 'Elena García', endorsed: true, doa: '' },
    { id: 9, name: 'Isabella Ferrari', endorsed: true, doa: '' },
  ];

  searchTerm = '';
  filteredDirectory: DirectoryMember[] = this.directory.filter(
    (member) => !this.isAlreadySelected(member.id)
  );

  constructor(private readonly dialogRef: MatDialogRef<ManageBiddersDialogComponent>) {}

  onSearch(term: string): void {
    this.searchTerm = term;
    const query = term.trim().toLowerCase();

    if (!query) {
      this.filteredDirectory = this.directory.filter((member) => !this.isAlreadySelected(member.id));
      return;
    }

    this.filteredDirectory = this.directory.filter(
      (member) =>
        member.name.toLowerCase().includes(query) && !this.isAlreadySelected(member.id)
    );
  }

  addMember(member: DirectoryMember): void {
    if (this.isAlreadySelected(member.id)) {
      return;
    }

    this.committeeMembers = [
      ...this.committeeMembers,
      { ...member, endorsed: true, doa: '' }
    ];
    this.onSearch(this.searchTerm);
  }

  removeMember(member: CommitteeMember): void {
    this.committeeMembers = this.committeeMembers.filter((existing) => existing.id !== member.id);
    this.onSearch(this.searchTerm);
  }

  toggleEndorsement(member: CommitteeMember, checked: boolean): void {
    member.endorsed = checked;
    this.committeeMembers = [...this.committeeMembers];
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    this.dialogRef.close({ committeeMembers: this.committeeMembers });
  }

  private isAlreadySelected(memberId: number): boolean {
    return this.committeeMembers.some((member) => member.id === memberId);
  }
}
