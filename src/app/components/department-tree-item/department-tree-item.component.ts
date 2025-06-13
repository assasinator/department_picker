import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DepartmentTreeNode } from '../../models/department.interface';

@Component({
  selector: 'app-department-tree-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './department-tree-item.component.html',
  styleUrls: ['./department-tree-item.component.css']
})
export class DepartmentTreeItemComponent {
  @Input() node!: DepartmentTreeNode;
  @Input() level: number = 0;
  @Output() selectionToggle = new EventEmitter<DepartmentTreeNode>();
  @Output() expansionToggle = new EventEmitter<DepartmentTreeNode>();

  onToggleSelection(): void {
    if (this.node.isLeaf) {
      this.selectionToggle.emit(this.node);
    }
  }

  onToggleExpansion(): void {
    if (!this.node.isLeaf) {
      this.expansionToggle.emit(this.node);
    }
  }

  getIndentStyle(): any {
    return {
      'margin-left': `${this.level * 20}px`
    };
  }

  getNodeStyle(): any {
    return {
      '--node-color': this.node.Color
    };
  }

  getNodeClasses(): string {
    let classes = '';
    if (this.node.isSelected) classes += 'selected ';
    if (!this.node.isLeaf) classes += 'parent-node ';
    return classes.trim();
  }
} 