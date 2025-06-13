import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartmentService } from '../../services/department.service';
import { Department, DepartmentTreeNode } from '../../models/department.interface';
import { DepartmentTreeItemComponent } from '../department-tree-item/department-tree-item.component';

@Component({
  selector: 'app-department-tree',
  standalone: true,
  imports: [CommonModule, FormsModule, DepartmentTreeItemComponent],
  templateUrl: './department-tree.component.html',
  styleUrls: ['./department-tree.component.css']
})
export class DepartmentTreeComponent implements OnInit, OnChanges {
  @Input() departments: Department[] = [];
  @Input() preSelectedIds: number[] = [];
  @Output() selectionChanged = new EventEmitter<number[]>();

  treeNodes: DepartmentTreeNode[] = [];
  filteredTreeNodes: DepartmentTreeNode[] = [];
  selectedIds: number[] = [];
  searchTerm: string = '';

  constructor(private departmentService: DepartmentService) {}

  ngOnInit(): void {
    this.initializeTree();
    this.subscribeToSelectionChanges();
  }

  ngOnChanges(): void {
    if (this.departments.length > 0) {
      this.initializeTree();
    }
  }

  private initializeTree(): void {
    this.treeNodes = this.departmentService.buildDepartmentTree(this.departments, this.preSelectedIds);
    this.filteredTreeNodes = [...this.treeNodes];
  }

  private subscribeToSelectionChanges(): void {
    this.departmentService.selectedDepartments$.subscribe(ids => {
      this.selectedIds = ids;
      this.selectionChanged.emit(ids);
    });
  }

  onNodeSelectionToggle(node: DepartmentTreeNode): void {
    const originalNode = this.findNodeInTree(this.treeNodes, node.OID);
    if (originalNode) {
      this.departmentService.toggleSelection(originalNode, this.treeNodes);
      this.applySearchFilter();
    }
  }

  onNodeExpansionToggle(node: DepartmentTreeNode): void {
    const originalNode = this.findNodeInTree(this.treeNodes, node.OID);
    if (originalNode) {
      this.departmentService.toggleExpansion(originalNode);
      this.applySearchFilter();
    }
  }

  onExpandAll(): void {
    this.departmentService.expandAll(this.filteredTreeNodes);
  }

  onCollapseAll(): void {
    this.departmentService.collapseAll(this.filteredTreeNodes);
  }

  onClearAll(): void {
    this.departmentService.clearAllSelections(this.treeNodes);
    this.applySearchFilter();
  }

  onSearchChange(): void {
    this.applySearchFilter();
  }

  onClearSearch(): void {
    this.searchTerm = '';
    this.applySearchFilter();
  }

  private applySearchFilter(): void {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.filteredTreeNodes = [...this.treeNodes];
    } else {
      this.filteredTreeNodes = this.filterNodes(this.treeNodes, this.searchTerm.toLowerCase());
    }
  }

  private findNodeInTree(nodes: DepartmentTreeNode[], targetOID: number): DepartmentTreeNode | null {
    for (const node of nodes) {
      if (node.OID === targetOID) {
        return node;
      }
      if (node.children.length > 0) {
        const found = this.findNodeInTree(node.children, targetOID);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  private filterNodes(nodes: DepartmentTreeNode[], searchTerm: string): DepartmentTreeNode[] {
    const filteredNodes: DepartmentTreeNode[] = [];

    nodes.forEach(node => {
      const nodeMatches = node.Title.toLowerCase().includes(searchTerm);
      const filteredChildren = this.filterNodes(node.children, searchTerm);
      
      if (nodeMatches || filteredChildren.length > 0) {
        const filteredNode: DepartmentTreeNode = {
          ...node,
          children: filteredChildren,
          isExpanded: filteredChildren.length > 0 ? true : node.isExpanded,
          isSelected: node.isSelected,
          selectedLeafCount: node.selectedLeafCount
        };
        filteredNodes.push(filteredNode);
      }
    });

    return filteredNodes;
  }

  /**
   * Check if the tree has deeply nested content (more than 3 levels)
   */
  hasDeepNesting(): boolean {
    const checkDepth = (nodes: DepartmentTreeNode[], currentDepth: number = 0): number => {
      let maxDepth = currentDepth;
      for (const node of nodes) {
        if (!node.isLeaf && node.children.length > 0) {
          const childDepth = checkDepth(node.children, currentDepth + 1);
          maxDepth = Math.max(maxDepth, childDepth);
        }
      }
      return maxDepth;
    };
    
    return checkDepth(this.treeNodes) > 2; // Show hint if more than 3 levels deep
  }
} 