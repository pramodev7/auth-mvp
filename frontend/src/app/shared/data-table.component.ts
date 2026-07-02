import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-data-table',
  template: `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            @for (column of columns; track column.key) {
              <th>{{ column.label }}</th>
            }
            @if (showActions) {
              <th class="actions-heading">Actions</th>
            }
          </tr>
        </thead>
        <tbody>
          <ng-content />
        </tbody>
      </table>
    </div>
  `,
  styles: [
    `
      .table-wrap {
        overflow-x: auto;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        min-width: 560px;
      }

      th,
      td {
        border-bottom: 1px solid #e1e6ef;
        padding: 12px;
        text-align: left;
      }

      th {
        color: #4b5870;
        font-size: 0.8rem;
        letter-spacing: 0;
        text-transform: uppercase;
      }

      .actions-heading {
        width: 180px;
      }
    `,
  ],
})
export class DataTableComponent {
  @Input({ required: true }) columns: { key: string; label: string }[] = [];
  @Input() showActions = false;
}
