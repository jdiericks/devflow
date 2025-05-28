# DevFlow - Project & Content Management Platform

A developer-centric platform designed to help developers and solo-devs manage their projects and content efficiently. Built with Vue 3, Vite, and Supabase.

## Features

- **Content Management**
  - Hierarchical content organization with tree structure
  - Rich text page editor
  - Media library for asset management
  - Drag-and-drop interface for content organization

- **Project Management**
  - Dashboard for project overview
  - Calendar view for scheduling and deadlines
  - Workspace management
  - Project organization

- **User Management**
  - Authentication system
  - User workspaces
  - Secure access control

## Tech Stack

- **Frontend**
  - Vue 3 with Composition API
  - Vite for build tooling
  - TailwindCSS for styling
  - Pinia for state management
  - Vue Router for navigation

- **Backend**
  - Supabase for backend services
  - Real-time database
  - Authentication
  - File storage

## Project Structure

```
src/
├── components/          # Vue components
│   ├── Dashboard.vue    # Main dashboard view
│   ├── PageEditor.vue   # Rich text editor
│   ├── MediaLibrary.vue # Media management
│   ├── CalendarView.vue # Calendar interface
│   ├── TreeNode.vue     # Tree structure component
│   └── Login.vue        # Authentication
├── stores/             # Pinia stores
│   ├── node.js         # Tree structure management
│   ├── project.js      # Project state
│   ├── auth.js         # Authentication state
│   ├── workspace.js    # Workspace management
│   └── media.js        # Media handling
└── assets/             # Static assets
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/devflow.git
cd devflow
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory and add your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

## State Management

The application uses Pinia for state management with the following stores:

- **Node Store**: Manages the hierarchical tree structure for content organization
- **Project Store**: Handles project-related state and operations
- **Auth Store**: Manages authentication state and user sessions
- **Workspace Store**: Controls workspace settings and organization
- **Media Store**: Handles media library operations and state

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you find a bug or have a feature request, please [open an issue](https://github.com/yourusername/devflow/issues).

## Acknowledgments

- Vue.js team for the amazing framework
- Supabase for the backend infrastructure
- All contributors who help improve this project
