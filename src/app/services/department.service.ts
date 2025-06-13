import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Department, DepartmentTreeNode } from '../models/department.interface';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private selectedDepartmentsSubject = new BehaviorSubject<number[]>([]);
  public selectedDepartments$ = this.selectedDepartmentsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getDepartments(filename: string = 'departments'): Observable<Department[]> {
    return this.http.get<Department[]>(`/assets/${filename}.json`);
  }

  buildDepartmentTree(departments: Department[], preSelectedIds: number[] = []): DepartmentTreeNode[] {
    const departmentMap = new Map<number, DepartmentTreeNode>();
    
    // Convert departments to tree nodes
    departments.forEach(dept => {
      departmentMap.set(dept.OID, {
        ...dept,
        children: [],
        isExpanded: false,
        isSelected: false,
        leafCount: 0,
        selectedLeafCount: 0,
        isLeaf: true
      });
    });

    // Build parent-child relationships
    const rootNodes: DepartmentTreeNode[] = [];
    departments.forEach(dept => {
      const node = departmentMap.get(dept.OID)!;
      
      if (dept.DepartmentParent_OID === null) {
        rootNodes.push(node);
      } else {
        const parent = departmentMap.get(dept.DepartmentParent_OID);
        if (parent) {
          parent.children.push(node);
          parent.isLeaf = false;
        }
      }
    });

    // Calculate leaf counts and set initial selections
    this.calculateLeafCounts(rootNodes);
    this.setInitialSelections(rootNodes, preSelectedIds);
    
    return rootNodes;
  }

  private calculateLeafCounts(nodes: DepartmentTreeNode[]): void {
    nodes.forEach(node => {
      if (node.isLeaf) {
        node.leafCount = 1;
      } else {
        this.calculateLeafCounts(node.children);
        node.leafCount = node.children.reduce((sum, child) => sum + child.leafCount, 0);
      }
    });
  }

  private setInitialSelections(nodes: DepartmentTreeNode[], preSelectedIds: number[]): void {
    nodes.forEach(node => {
      if (node.isLeaf && preSelectedIds.includes(node.OID)) {
        node.isSelected = true;
      }
      
      if (!node.isLeaf) {
        this.setInitialSelections(node.children, preSelectedIds);
        node.selectedLeafCount = this.getSelectedLeafCount(node);
      }
    });
    
    this.updateSelectedDepartments(nodes);
  }

  toggleSelection(node: DepartmentTreeNode, rootNodes: DepartmentTreeNode[]): void {
    if (node.isLeaf) {
      node.isSelected = !node.isSelected;
      this.updateParentCounts(rootNodes);
      this.updateSelectedDepartments(rootNodes);
    }
  }

  toggleExpansion(node: DepartmentTreeNode): void {
    if (!node.isLeaf) {
      node.isExpanded = !node.isExpanded;
    }
  }

  private updateParentCounts(nodes: DepartmentTreeNode[]): void {
    nodes.forEach(node => {
      if (!node.isLeaf) {
        this.updateParentCounts(node.children);
        node.selectedLeafCount = this.getSelectedLeafCount(node);
      }
    });
  }

  private getSelectedLeafCount(node: DepartmentTreeNode): number {
    if (node.isLeaf) {
      return node.isSelected ? 1 : 0;
    }
    
    return node.children.reduce((sum, child) => sum + this.getSelectedLeafCount(child), 0);
  }

  private updateSelectedDepartments(nodes: DepartmentTreeNode[]): void {
    const selectedIds = this.getSelectedLeafIds(nodes);
    this.selectedDepartmentsSubject.next(selectedIds);
  }

  private getSelectedLeafIds(nodes: DepartmentTreeNode[]): number[] {
    const selectedIds: number[] = [];
    
    nodes.forEach(node => {
      if (node.isLeaf && node.isSelected) {
        selectedIds.push(node.OID);
      } else if (!node.isLeaf) {
        selectedIds.push(...this.getSelectedLeafIds(node.children));
      }
    });
    
    return selectedIds;
  }

  getSelectedDepartmentIds(): number[] {
    return this.selectedDepartmentsSubject.value;
  }

  expandAll(nodes: DepartmentTreeNode[]): void {
    nodes.forEach(node => {
      if (!node.isLeaf) {
        node.isExpanded = true;
        this.expandAll(node.children);
      }
    });
  }

  collapseAll(nodes: DepartmentTreeNode[]): void {
    nodes.forEach(node => {
      if (!node.isLeaf) {
        node.isExpanded = false;
        this.collapseAll(node.children);
      }
    });
  }

  clearAllSelections(nodes: DepartmentTreeNode[]): void {
    nodes.forEach(node => {
      if (node.isLeaf) {
        node.isSelected = false;
      } else {
        this.clearAllSelections(node.children);
      }
    });
    this.updateParentCounts(nodes);
    this.updateSelectedDepartments(nodes);
  }
} 