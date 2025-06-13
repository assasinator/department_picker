export interface Department {
  OID: number;
  Title: string;
  Color: string;
  DepartmentParent_OID: number | null;
}

export interface DepartmentTreeNode extends Department {
  children: DepartmentTreeNode[];
  isExpanded: boolean;
  isSelected: boolean;
  leafCount: number;
  selectedLeafCount: number;
  isLeaf: boolean;
} 