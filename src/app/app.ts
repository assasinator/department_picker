import { Component, OnInit, Input } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartmentTreeComponent } from './components/department-tree/department-tree.component';
import { DepartmentService } from './services/department.service';
import { Department } from './models/department.interface';

interface DataSource {
  value: string;
  label: string;
  description?: string;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule, DepartmentTreeComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  @Input() initialSelectedIds: number[] = []; // Allow external pre-selection
  
  protected title = 'Department Tree Picker';
  departments: Department[] = [];
  preSelectedIds: number[] = []; // Simple variable for pre-selection during build
  selectedDepartments: number[] = [];
  selectedDataSource: string = 'departments';

  // Default data sources (can be extended by uploads)
  defaultDataSources: DataSource[] = [
    { value: 'departments', label: 'News Departments', description: 'US News, International, Politics, Opinion' },
    { value: 'departments2', label: 'Tech & Business', description: 'Technology, Business, Lifestyle categories' },
    { value: 'department3', label: 'Science & Tech', description: 'Science & Technology, Arts & Culture, Sports' }
  ];

  // Dynamic list that includes uploaded files
  availableDataSources: DataSource[] = [];
  uploadedFiles: Map<string, any> = new Map();

  constructor(private departmentService: DepartmentService) {
    // Set pre-selected IDs here - can be configured during build
    // Example: this.preSelectedIds = [ 3, 5];
    this.preSelectedIds = [3,5]; // Example: pre-select departments with IDs 3 and 5
  }

  ngOnInit(): void {
    this.availableDataSources = [...this.defaultDataSources];
    
    // Use input property if provided, otherwise use the build-time variable
    if (this.initialSelectedIds && this.initialSelectedIds.length > 0) {
      this.preSelectedIds = [...this.initialSelectedIds];
    }
    
    this.loadDepartments();
  }

  private loadDepartments(): void {
    // Check if it's an uploaded file
    if (this.uploadedFiles.has(this.selectedDataSource)) {
      const uploadedData = this.uploadedFiles.get(this.selectedDataSource);
      this.departments = uploadedData;
      this.selectedDepartments = [];
    } else {
      // Load from assets
      this.departmentService.getDepartments(this.selectedDataSource).subscribe({
        next: (departments) => {
          this.departments = departments;
          this.selectedDepartments = [];
        },
        error: (error) => {
          console.error('Error loading departments:', error);
        }
      });
    }
  }

  onDataSourceChange(): void {
    // Clear pre-selections when changing data source to avoid invalid IDs
    this.preSelectedIds = [];
    this.loadDepartments();
  }

  onFileUpload(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          
          // Validate that it's a valid department structure
          if (this.validateDepartmentStructure(jsonData)) {
            const fileName = file.name.replace('.json', '');
            const dataSourceKey = `uploaded_${fileName}`;
            
            // Store the uploaded data
            this.uploadedFiles.set(dataSourceKey, jsonData);
            
            // Add to available data sources
            const newDataSource: DataSource = {
              value: dataSourceKey,
              label: `📁 ${fileName}`,
              description: `Uploaded file: ${file.name}`
            };
            
            // Check if already exists and update, otherwise add
            const existingIndex = this.availableDataSources.findIndex(ds => ds.value === dataSourceKey);
            if (existingIndex >= 0) {
              this.availableDataSources[existingIndex] = newDataSource;
            } else {
              this.availableDataSources.push(newDataSource);
            }
            
            // Switch to the newly uploaded file
            this.selectedDataSource = dataSourceKey;
            this.loadDepartments();
            
            console.log(`Successfully uploaded: ${file.name}`);
          } else {
            alert('Oops! It looks like the JSON you provided has an invalid structure. Please ensure the file contains valid json Structure.');
          }
        } catch (error) {
          alert('Oops! It looks like the JSON you provided is invalid. Please check the format and try again');
          console.error('JSON parsing error:', error);
        }
      };
      reader.readAsText(file);
    } else {
      alert('Please select a valid JSON file.');
    }
    
    // Reset the file input
    event.target.value = '';
  }

  private validateDepartmentStructure(data: any): boolean {
    if (!Array.isArray(data)) return false;
    
    // Check if each item has required department properties
    return data.every(item => 
      typeof item === 'object' &&
      typeof item.OID === 'number' &&
      typeof item.Title === 'string' &&
      typeof item.Color === 'string' &&
      (item.DepartmentParent_OID === null || typeof item.DepartmentParent_OID === 'number')
    );
  }

  onSelectionChanged(selectedIds: number[]): void {
    this.selectedDepartments = selectedIds;
    console.log('Selected departments:', selectedIds);
  }

  getSelectionPercentage(): number {
    if (this.departments.length === 0) return 0;
    return Math.round((this.selectedDepartments.length / this.departments.length) * 100);
  }
}
