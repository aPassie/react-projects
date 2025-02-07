// Project Templates for Admin Use

export const projectTemplates = [
  {
    title: "Beginner Level Project Template",
    description: "A perfect starting point for beginners. This template includes basic concepts like HTML structure, CSS styling, and fundamental JavaScript interactions. Ideal for building your first interactive web application.",
    difficulty: "beginner",
    category: "web-development",
    estimatedHours: 6,
    tags: ["html", "css", "javascript", "beginner-friendly"],
    steps: [
      {
        title: "Project Structure Setup",
        description: "Set up the basic project structure with HTML, CSS, and JavaScript files. Learn about file organization and linking files together.",
        code: `<!DOCTYPE html>
<html>
<head>
  <title>Your Project Title</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <header>
      <h1>Welcome to Your Project</h1>
    </header>
    <main>
      <!-- Your content will go here -->
    </main>
  </div>
  <script src="app.js"></script>
</body>
</html>`,
        tips: [
          "Keep your file structure organized",
          "Use semantic HTML elements",
          "Link your CSS and JavaScript files properly"
        ],
        hint: "Start with a clean, well-organized file structure. It will make development much easier as your project grows."
      },
      {
        title: "Basic Styling",
        description: "Add basic CSS styling to your project. Learn about selectors, colors, layout, and responsive design.",
        code: `/* styles.css */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  text-align: center;
  padding: 2rem 0;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
}`,
        tips: [
          "Use CSS variables for consistent colors and values",
          "Make your design mobile-responsive",
          "Keep your CSS organized and well-commented"
        ],
        hint: "Focus on making your design responsive from the start. Mobile-first approach is recommended."
      },
      {
        title: "JavaScript Functionality",
        description: "Implement basic JavaScript functionality. Learn about DOM manipulation, event handling, and basic user interactions.",
        code: `// app.js
document.addEventListener('DOMContentLoaded', () => {
  // Your initialization code here
  console.log('App initialized');
});

function handleUserAction(event) {
  // Handle user interactions here
  console.log('User action:', event.type);
}`,
        tips: [
          "Start with simple event listeners",
          "Use console.log for debugging",
          "Keep your functions small and focused"
        ],
        hint: "Break down your JavaScript functionality into small, manageable pieces. Test each piece before moving on."
      }
    ]
  },
  {
    title: "Intermediate Level Project Template",
    description: "A template for developers ready to tackle more complex concepts. Includes state management, API integration, and more advanced UI interactions. Perfect for building dynamic web applications.",
    difficulty: "intermediate",
    category: "web-development",
    estimatedHours: 12,
    tags: ["api-integration", "state-management", "async-programming"],
    steps: [
      {
        title: "Advanced Project Setup",
        description: "Set up a more complex project structure with proper module organization, state management, and development tools.",
        code: `// config.js
export const config = {
  apiBaseUrl: process.env.API_BASE_URL || 'https://api.example.com',
  defaultOptions: {
    // Your default configuration
  }
};

// state/index.js
export class StateManager {
  constructor() {
    this.state = {};
    this.listeners = new Set();
  }

  updateState(newState) {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}`,
        tips: [
          "Use proper module organization",
          "Implement a state management solution",
          "Set up error handling early"
        ],
        hint: "Consider how your application will scale. Good architecture decisions now will save time later."
      },
      {
        title: "API Integration",
        description: "Implement API integration with proper error handling, loading states, and data caching.",
        code: `// api/client.js
export class ApiClient {
  async fetchData(endpoint, options = {}) {
    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
}`,
        tips: [
          "Implement proper error handling",
          "Add loading states for better UX",
          "Consider implementing data caching"
        ],
        hint: "Always handle edge cases in your API calls. Users should never see an unhandled error."
      },
      {
        title: "Advanced UI Features",
        description: "Implement advanced UI features like infinite scrolling, dynamic filtering, and real-time updates.",
        code: `// features/infiniteScroll.js
export function setupInfiniteScroll(container, loadMore) {
  const observer = new IntersectionObserver(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting) {
        loadMore();
      }
    },
    { threshold: 0.1 }
  );

  const sentinel = document.createElement('div');
  container.appendChild(sentinel);
  observer.observe(sentinel);

  return () => observer.disconnect();
}`,
        tips: [
          "Use modern browser APIs",
          "Implement proper cleanup",
          "Consider performance implications"
        ],
        hint: "Test your UI features across different devices and browsers to ensure consistent behavior."
      }
    ]
  },
  {
    title: "Advanced Level Project Template",
    description: "A template for experienced developers ready for complex applications. Includes advanced patterns, optimization techniques, and scalable architecture. Ideal for building enterprise-level applications.",
    difficulty: "advanced",
    category: "web-development",
    estimatedHours: 20,
    tags: ["advanced-patterns", "optimization", "scalable-architecture"],
    steps: [
      {
        title: "Advanced Architecture Setup",
        description: "Set up a scalable architecture using advanced design patterns and best practices for large applications.",
        code: `// core/di-container.js
export class Container {
  private services = new Map();

  register(token: string, factory: Function) {
    this.services.set(token, {
      factory,
      instance: null,
      dependencies: this.extractDependencies(factory)
    });
  }

  resolve(token: string) {
    const service = this.services.get(token);
    if (!service) {
      throw new Error(\`Service \${token} not found\`);
    }
    
    if (!service.instance) {
      const dependencies = service.dependencies.map(dep => this.resolve(dep));
      service.instance = service.factory(...dependencies);
    }
    
    return service.instance;
  }
}`,
        tips: [
          "Implement dependency injection",
          "Use proper design patterns",
          "Consider testability from the start"
        ],
        hint: "Focus on creating a maintainable and testable architecture. Consider how the application will scale."
      },
      {
        title: "Performance Optimization",
        description: "Implement advanced performance optimization techniques including code splitting, lazy loading, and caching strategies.",
        code: `// core/performance.js
export class PerformanceOptimizer {
  constructor() {
    this.cache = new Map();
    this.pendingPromises = new Map();
  }

  async loadModule(modulePath) {
    // Implement dynamic import with caching
    if (this.cache.has(modulePath)) {
      return this.cache.get(modulePath);
    }

    if (this.pendingPromises.has(modulePath)) {
      return this.pendingPromises.get(modulePath);
    }

    const promise = import(/* webpackChunkName: "[request]" */ modulePath)
      .then(module => {
        this.cache.set(modulePath, module);
        this.pendingPromises.delete(modulePath);
        return module;
      });

    this.pendingPromises.set(modulePath, promise);
    return promise;
  }
}`,
        tips: [
          "Implement code splitting",
          "Use performance monitoring",
          "Optimize bundle size"
        ],
        hint: "Always measure performance impact before and after optimizations. Use proper metrics and monitoring."
      },
      {
        title: "Advanced State Management",
        description: "Implement complex state management with support for middleware, time-travel debugging, and state persistence.",
        code: `// state/advanced-store.js
export class AdvancedStore {
  constructor(reducer, middleware = []) {
    this.reducer = reducer;
    this.state = reducer(undefined, { type: '@@INIT' });
    this.listeners = new Set();
    this.middleware = middleware.map(m => m(this));
    this.history = [];
  }

  dispatch(action) {
    let processedAction = action;
    for (const middleware of this.middleware) {
      processedAction = middleware(processedAction);
    }

    this.state = this.reducer(this.state, processedAction);
    this.history.push({ action: processedAction, state: this.state });
    this.notifyListeners();
  }

  timeTravel(index) {
    if (index >= 0 && index < this.history.length) {
      this.state = this.history[index].state;
      this.history = this.history.slice(0, index + 1);
      this.notifyListeners();
    }
  }
}`,
        tips: [
          "Implement proper state immutability",
          "Add debugging capabilities",
          "Consider state persistence"
        ],
        hint: "Complex state management requires careful consideration of performance and debugging capabilities."
      }
    ]
  }
];
