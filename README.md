# Department Picker

A comprehensive Angular department selection component with hierarchical tree structure, search functionality, and pre-selection capabilities.

## Features

- **Hierarchical Tree Structure** - Nested department categories with expand/collapse
- **Real-time Search** - Filter departments with auto-expanding parent nodes
- **Pre-selection Support** - Simple variable for pre-selecting departments during build
- **Responsive Design** - Mobile-first responsive layout
- **Department Colors** - Visual theming based on department colors
- **Dynamic Data Loading** - Upload custom JSON files
- **Selection Statistics** - Count, percentage, and summary displays

## Installation & Setup

```bash
# Install dependencies
npm install

# Start development server
ng serve

# Build for production
ng build
```

## Basic Usage

### Simple Implementation
```html
<app-root></app-root>
```

### With Pre-selected Departments
```html
<app-root [initialSelectedIds]="[1, 2, 3]"></app-root>
```

## Advanced Configuration

### Pre-selection Methods

#### Method 1: Build-time Configuration
Configure pre-selected departments directly in the component constructor in `src/app/app.ts`:

```typescript
constructor(private departmentService: DepartmentService) {
  // Set pre-selected IDs here - can be configured during build
  this.preSelectedIds = [1, 3, 5]; // Pre-select departments with IDs 1, 3, and 5
}
```

#### Method 2: Input Property (for component reuse)
Pass pre-selected IDs as an input property:

```typescript
// In your parent component
@Component({
  template: `<app-root [initialSelectedIds]="[1, 3, 5]"></app-root>`
})
export class MyComponent {
  // Pre-select departments with IDs 1, 3, and 5
}
```

## Data Structure

Departments should follow this JSON structure:

```json
[
  {
    "OID": 1,
    "Title": "Department Name",
    "Color": "#F52612",
    "DepartmentParent_OID": null
  },
  {
    "OID": 2,
    "Title": "Sub Department",
    "Color": "#0066CC",
    "DepartmentParent_OID": 1
  }
]
```

### Field Descriptions
- `OID`: Unique identifier for the department
- `Title`: Display name of the department
- `Color`: Hex color code for visual theming
- `DepartmentParent_OID`: Parent department ID (null for root departments)

## Development

### Commands
```bash
# Install dependencies
npm install

# Start development server
ng serve

# Build for production
ng build

# Run tests
ng test

# Run linting
ng lint
```

### Project Structure
- `src/app/app.ts` - Main component with pre-selection configuration
- `src/app/department.service.ts` - Service for department data management
- Department data can be loaded via JSON file upload

## Examples

### Example 1: HR Department Tree
```typescript
// Pre-select HR and sub-departments
this.preSelectedIds = [100, 101, 102]; // HR, Recruitment, Training
```

### Example 2: Multiple Root Departments
```typescript
// Pre-select entire department branches
this.preSelectedIds = [1, 10, 20]; // IT, Sales, Marketing departments
```

### Example 3: Dynamic Pre-selection
```typescript
// Configure based on user role or environment
constructor(private departmentService: DepartmentService) {
  const userRole = this.getUserRole();
  this.preSelectedIds = this.getPreselectedByRole(userRole);
}
```
