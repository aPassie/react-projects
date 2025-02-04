import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Clock, FileText, Code, AlertCircle, Link as LinkIcon, Play, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface ProjectStep {
  title: string;
  description: string;
  code?: string;
  pitfalls?: string[];
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Cart {
  items: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
}

const MOCK_PROJECT_DATA = {
  'todo-app': {
    title: 'Todo App',
    description: 'Build a simple todo application to learn React basics, components, and state management.',
    difficulty: 'beginner',
    prerequisites: ['Basic JavaScript', 'HTML & CSS', 'React Fundamentals'],
    duration: '2-3 hours',
    techStack: ['React', 'TypeScript', 'Tailwind CSS'],
    steps: [
      {
        title: 'Setting up the Project',
        description: 'Create a new React project using Vite and install necessary dependencies.',
        code: 'npm create vite@latest my-todo-app -- --template react-ts',
      },
      {
        title: 'Creating the Todo Component',
        description: 'Create a basic component structure for the todo list.',
        code: `interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  // ... implementation
};`,
        pitfalls: [
          'Remember to properly type your state using TypeScript',
          'Ensure unique IDs for each todo item',
        ],
      },
    ],
    repoLink: 'https://github.com/example/todo-app',
    demoLink: 'https://todo-app-demo.example.com',
  },
  'counter-app': {
    title: 'Counter App',
    description: 'Build a simple counter application to understand React state management and event handling.',
    difficulty: 'beginner',
    prerequisites: ['Basic JavaScript', 'React Fundamentals'],
    duration: '1-2 hours',
    techStack: ['React', 'TypeScript', 'Tailwind CSS'],
    steps: [
      {
        title: 'Project Setup',
        description: 'Create a new React project with TypeScript and install dependencies.',
        code: 'npm create vite@latest counter-app -- --template react-ts',
      },
      {
        title: 'Creating the Counter Component',
        description: 'Create a counter component with increment and decrement functionality.',
        code: `const Counter = () => {
  const [count, setCount] = useState<number>(0);

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-4xl font-bold">{count}</h2>
      <div className="flex gap-4">
        <button onClick={decrement}>-</button>
        <button onClick={increment}>+</button>
      </div>
    </div>
  );
};`,
        pitfalls: [
          'Remember to handle negative numbers if needed',
          'Consider adding a reset button',
          'Think about step size customization',
        ],
      },
      {
        title: 'Adding Features',
        description: 'Enhance the counter with additional features like reset and custom increment.',
        code: `const [step, setStep] = useState<number>(1);
const reset = () => setCount(0);
const incrementByStep = () => setCount(prev => prev + step);`,
        pitfalls: [
          'Validate user input for custom step size',
          'Consider adding max/min limits',
        ],
      },
    ],
    repoLink: 'https://github.com/example/counter-app',
    demoLink: 'https://counter-app-demo.example.com',
  },
  'weather-widget': {
    title: 'Weather Widget',
    description: 'Create a weather widget that fetches and displays weather data from an API.',
    difficulty: 'intermediate',
    prerequisites: ['React Fundamentals', 'API Integration', 'Async JavaScript'],
    duration: '3-4 hours',
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'OpenWeather API'],
    steps: [
      {
        title: 'Project Setup',
        description: 'Create a new React project and install required dependencies.',
        code: `npm create vite@latest weather-widget -- --template react-ts
npm install axios`,
      },
      {
        title: 'API Integration',
        description: 'Set up OpenWeather API integration and create interface types.',
        code: `interface WeatherData {
  main: {
    temp: number;
    humidity: number;
    feels_like: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
}

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const fetchWeather = async (city: string): Promise<WeatherData> => {
  const response = await axios.get(
    \`https://api.openweathermap.org/data/2.5/weather?q=\${city}&appid=\${API_KEY}&units=metric\`
  );
  return response.data;
};`,
        pitfalls: [
          'Always handle API errors gracefully',
          'Store API keys in environment variables',
          'Implement loading states',
        ],
      },
      {
        title: 'Creating the Weather Component',
        description: 'Build the weather display component with search functionality.',
        code: `const WeatherWidget = () => {
  const [city, setCity] = useState<string>('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const data = await fetchWeather(city);
      setWeather(data);
    } catch (error) {
      console.error('Failed to fetch weather:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-lg shadow-lg">
      {/* Implementation */}
    </div>
  );
};`,
        pitfalls: [
          'Implement debouncing for search',
          'Cache previous results',
          'Add error boundaries',
        ],
      },
    ],
    repoLink: 'https://github.com/example/weather-widget',
    demoLink: 'https://weather-widget-demo.example.com',
  },
  'shopping-cart': {
    title: 'Shopping Cart',
    description: 'Create a fully functional shopping cart with product listing, cart management, and checkout process.',
    difficulty: 'advanced',
    prerequisites: ['React Fundamentals', 'State Management', 'React Context'],
    duration: '4-5 hours',
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'React Context'],
    steps: [
      {
        title: 'Project Setup and Data Modeling',
        description: 'Set up the project and create interfaces for products and cart items.',
        code: `interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  total: number;
}`,
        pitfalls: [
          'Plan your data structure carefully',
          'Consider using unique IDs for products',
          'Think about quantity limitations',
        ],
      },
      {
        title: 'Creating the Cart Context',
        description: 'Implement the shopping cart context for state management.',
        code: `export const CartContext = createContext<CartContextType>({} as CartContextType);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product) => {
    setItems(current => {
      const existing = current.find(item => item.id === product.id);
      if (existing) {
        return current.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  };

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};`,
        pitfalls: [
          'Handle edge cases in quantity updates',
          'Implement proper error handling',
          'Consider cart persistence',
        ],
      },
      {
        title: 'Building the UI Components',
        description: 'Create the product list and cart components with a clean, modern design.',
        code: `// Define the cart hook for managing cart state
const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);

  const updateQuantity = (id: string, quantity: number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  return { items, updateQuantity, removeItem };
};

// Cart item component for displaying individual items
const CartItem = ({ item }: { item: CartItem }) => {
  const { updateQuantity, removeItem } = useCart();
  
  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg">
      <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
      <div className="flex-1">
        <h3 className="font-medium">{item.name}</h3>
        <p className="text-sm text-muted-foreground">\${item.price}</p>
        <div className="flex items-center gap-2 mt-2">
          <Button size="sm" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</Button>
          <span>{item.quantity}</span>
          <Button size="sm" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
        </div>
      </div>
      <Button variant="destructive" size="sm" onClick={() => removeItem(item.id)}>
        Remove
      </Button>
    </div>
  );
};`,
        pitfalls: [
          'Ensure responsive design',
          'Add loading states for async operations',
          'Implement proper form validation',
        ],
      },
    ],
    repoLink: 'https://github.com/example/shopping-cart',
    demoLink: 'https://shopping-cart-demo.example.com',
  },
  'movie-search': {
    title: 'Movie Search App',
    description: 'Build a movie search application using the TMDB API with advanced features like infinite scrolling and favorites.',
    difficulty: 'advanced',
    prerequisites: ['API Integration', 'React Query', 'Custom Hooks'],
    duration: '3-4 hours',
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'React Query', 'TMDB API'],
    steps: [
      {
        title: 'Project Setup and API Integration',
        description: 'Set up the project and implement TMDB API integration with React Query.',
        code: `interface Movie {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  vote_average: number;
  release_date: string;
}

const useMovieSearch = (query: string) => {
  return useQuery({
    queryKey: ['movies', query],
    queryFn: async () => {
      const response = await fetch(
        \`https://api.themoviedb.org/3/search/movie?api_key=\${API_KEY}&query=\${query}\`
      );
      const data = await response.json();
      return data.results as Movie[];
    },
    enabled: Boolean(query),
  });
};`,
        pitfalls: [
          'Handle API rate limiting',
          'Implement proper error boundaries',
          'Consider caching strategies',
        ],
      },
      {
        title: 'Implementing Infinite Scroll',
        description: 'Add infinite scrolling functionality using Intersection Observer.',
        code: `const useInfiniteScroll = (callback: () => void) => {
  const observer = useRef<IntersectionObserver>();
  
  const lastElementRef = useCallback((node: HTMLElement | null) => {
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        callback();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [callback]);
  
  return lastElementRef;
};`,
        pitfalls: [
          'Handle loading states properly',
          'Implement scroll restoration',
          'Consider mobile performance',
        ],
      },
      {
        title: 'Building the Movie Card Component',
        description: 'Create an attractive movie card with hover effects and animations.',
        code: `const MovieCard = ({ movie }: { movie: Movie }) => {
  const imageUrl = \`https://image.tmdb.org/t/p/w500\${movie.poster_path}\`;
  
  return (
    <div className="group relative overflow-hidden rounded-lg">
      <img
        src={imageUrl}
        alt={movie.title}
        className="w-full aspect-[2/3] object-cover transition-transform group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
        <h3 className="text-white font-medium">{movie.title}</h3>
        <p className="text-white/80 text-sm mt-1">
          {new Date(movie.release_date).getFullYear()}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <StarIcon className="w-4 h-4 text-yellow-400" />
          <span className="text-white">{movie.vote_average.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};`,
        pitfalls: [
          'Handle missing images gracefully',
          'Optimize image loading',
          'Ensure keyboard accessibility',
        ],
      },
    ],
    repoLink: 'https://github.com/example/movie-search',
    demoLink: 'https://movie-search-demo.example.com',
  },
  'task-manager': {
    title: 'Task Manager',
    description: 'Create a full-featured task management application with drag-and-drop, categories, and filters.',
    difficulty: 'advanced',
    prerequisites: ['Advanced React', 'State Management', 'React DnD'],
    duration: '5-6 hours',
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'React DnD', 'Zustand'],
    steps: [
      {
        title: 'Project Setup and State Management',
        description: 'Set up the project and implement state management with Zustand.',
        code: `interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  tags: string[];
}

interface TaskStore {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  moveTask: (id: string, status: Task['status']) => void;
}

const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  addTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, { ...task, id: nanoid() }],
    })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    })),
  moveTask: (id, status) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, status } : task
      ),
    })),
}));`,
        pitfalls: [
          'Plan the state structure carefully',
          'Consider undo/redo functionality',
          'Handle concurrent updates',
        ],
      },
      {
        title: 'Implementing Drag and Drop',
        description: 'Add drag and drop functionality using React DnD.',
        code: `interface ColumnProps {
  status: Task['status'];
  tasks: Task[];
}

const Column = ({ status, tasks }: ColumnProps) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'task',
    drop: (item: { id: string }) => {
      useTaskStore.getState().moveTask(item.id, status);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      className={\`p-4 rounded-lg bg-muted/50 \${
        isOver ? 'ring-2 ring-primary' : ''
      }\`}
    >
      <h3 className="font-medium mb-4">{status}</h3>
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};`,
        pitfalls: [
          'Handle drag preview images',
          'Consider touch devices',
          'Implement drag constraints',
        ],
      },
      {
        title: 'Building Advanced Features',
        description: 'Add filters, sorting, and task analytics.',
        code: `const TaskAnalytics = () => {
  const tasks = useTaskStore((state) => state.tasks);
  
  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'done').length,
    overdue: tasks.filter((t) => {
      return t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done';
    }).length,
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Tasks</CardTitle>
          <CardDescription>{stats.total}</CardDescription>
        </CardHeader>
      </Card>
      {/* More stats cards */}
    </div>
  );
};`,
        pitfalls: [
          'Optimize performance for large datasets',
          'Implement proper date handling',
          'Consider data persistence',
        ],
      },
    ],
    repoLink: 'https://github.com/example/task-manager',
    demoLink: 'https://task-manager-demo.example.com',
  },
  'social-media-dashboard': {
    title: 'Social Media Dashboard',
    description: 'Create a social media dashboard with real-time updates and complex data visualization.',
    difficulty: 'expert',
    prerequisites: ['Advanced React', 'WebSocket', 'Data Visualization'],
    duration: '8-10 hours',
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Socket.io', 'D3.js', 'React Query'],
    steps: [
      {
        title: 'Setting up Real-time Infrastructure',
        description: 'Implement WebSocket connection and real-time data handling.',
        code: `interface SocketMessage {
  type: 'post' | 'like' | 'comment' | 'share';
  payload: any;
  from: string;
  to: string;
}

const useSocket = () => {
  const socket = useRef<Socket>();
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<SocketMessage[]>([]);

  useEffect(() => {
    socket.current = io(SOCKET_URL);

    socket.current.on('connect', () => {
      setIsConnected(true);
    });

    socket.current.on('message', (message: SocketMessage) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.current?.disconnect();
    };
  }, []);

  return { isConnected, messages };
};`,
        pitfalls: [
          'Handle WebSocket reconnection',
          'Implement message queuing',
          'Consider connection timeouts',
        ],
      },
      {
        title: 'Building Data Visualizations',
        description: 'Create interactive charts and graphs using D3.js.',
        code: `const EngagementChart = ({ data }: { data: EngagementData[] }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = select(svgRef.current);
    const width = 600;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    const x = scaleTime()
      .domain(extent(data, d => d.date) as [Date, Date])
      .range([margin.left, width - margin.right]);

    const y = scaleLinear()
      .domain([0, max(data, d => d.value) as number])
      .range([height - margin.bottom, margin.top]);

    const line = d3.line<EngagementData>()
      .x(d => x(d.date))
      .y(d => y(d.value))
      .curve(curveMonotoneX);

    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'currentColor')
      .attr('stroke-width', 1.5)
      .attr('d', line);
  }, [data]);

  return <svg ref={svgRef} className="w-full h-full" />;
};`,
        pitfalls: [
          'Optimize rendering performance',
          'Handle responsive layouts',
          'Implement proper animations',
        ],
      },
      {
        title: 'Implementing Analytics Dashboard',
        description: 'Create a comprehensive analytics dashboard with multiple views.',
        code: `const Dashboard = () => {
  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: fetchAnalytics,
    refetchInterval: 60000, // Refresh every minute
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Engagement Overview</CardTitle>
          <CardDescription>Real-time user engagement metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <EngagementChart data={analytics.engagement} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Top Posts</CardTitle>
          <CardDescription>Most engaging content</CardDescription>
        </CardHeader>
        <CardContent>
          <TopPostsList posts={analytics.topPosts} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>User Activity</CardTitle>
          <CardDescription>Active users over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityHeatmap data={analytics.activity} />
        </CardContent>
      </Card>
    </div>
  );
};`,
        pitfalls: [
          'Handle data loading states',
          'Implement error boundaries',
          'Consider data caching strategies',
        ],
      },
    ],
    repoLink: 'https://github.com/example/social-media-dashboard',
    demoLink: 'https://social-media-dashboard-demo.example.com',
  },
  'code-editor': {
    title: 'Code Editor',
    description: 'Build a web-based code editor with syntax highlighting and file system integration.',
    difficulty: 'expert',
    prerequisites: ['Advanced React', 'Monaco Editor', 'File System API'],
    duration: '10-12 hours',
    techStack: ['React', 'TypeScript', 'Monaco Editor', 'File System API', 'Web Workers'],
    steps: [
      {
        title: 'Setting up Monaco Editor',
        description: 'Integrate Monaco Editor with React and implement basic functionality.',
        code: `import * as Monaco from 'monaco-editor';
import { useRef, useEffect } from 'react';

interface EditorProps {
  language: string;
  theme: 'vs-dark' | 'vs-light';
  value: string;
  onChange: (value: string) => void;
}

const CodeEditor = ({ language, theme, value, onChange }: EditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<Monaco.editor.IStandaloneCodeEditor>();

  useEffect(() => {
    if (!editorRef.current) return;

    monacoRef.current = Monaco.editor.create(editorRef.current, {
      value,
      language,
      theme,
      automaticLayout: true,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      fontSize: 14,
      lineNumbers: 'on',
      roundedSelection: false,
      scrollbar: {
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10,
      },
    });

    monacoRef.current.onDidChangeModelContent(() => {
      onChange(monacoRef.current?.getValue() || '');
    });

    return () => monacoRef.current?.dispose();
  }, []);

  return <div ref={editorRef} className="h-full w-full" />;
};`,
        pitfalls: [
          'Handle editor disposal',
          'Implement proper theming',
          'Consider memory management',
        ],
      },
      {
        title: 'Implementing File System Integration',
        description: 'Add file system capabilities using the File System Access API.',
        code: `interface FileSystemState {
  currentFile: FileSystemFileHandle | null;
  files: Map<string, FileSystemFileHandle>;
}

const useFileSystem = () => {
  const [state, setState] = useState<FileSystemState>({
    currentFile: null,
    files: new Map(),
  });

  const openFile = async () => {
    try {
      const [fileHandle] = await window.showOpenFilePicker({
        types: [
          {
            description: 'Text Files',
            accept: {
              'text/*': ['.txt', '.js', '.ts', '.json'],
            },
          },
        ],
      });

      const file = await fileHandle.getFile();
      const contents = await file.text();

      setState(prev => ({
        ...prev,
        currentFile: fileHandle,
        files: new Map(prev.files).set(file.name, fileHandle),
      }));

      return contents;
    } catch (error) {
      console.error('Error opening file:', error);
    }
  };

  const saveFile = async (content: string) => {
    if (!state.currentFile) return;

    try {
      const writable = await state.currentFile.createWritable();
      await writable.write(content);
      await writable.close();
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  return { ...state, openFile, saveFile };
};`,
        pitfalls: [
          'Handle file permissions',
          'Implement auto-save',
          'Consider unsaved changes',
        ],
      },
      {
        title: 'Adding Advanced Features',
        description: 'Implement features like syntax highlighting, code formatting, and extensions.',
        code: `const useFormatter = (language: string) => {
  const format = async (code: string) => {
    const worker = new Worker('formatter.worker.js');
    
    return new Promise<string>((resolve, reject) => {
      worker.onmessage = (event) => {
        resolve(event.data);
        worker.terminate();
      };

      worker.onerror = (error) => {
        reject(error);
        worker.terminate();
      };

      worker.postMessage({ code, language });
    });
  };

  return { format };
};

const EditorToolbar = ({ onFormat, onSave }: EditorToolbarProps) => {
  return (
    <div className="flex items-center gap-2 p-2 border-b">
      <Button onClick={onSave} className="flex items-center gap-2">
        <Save className="w-4 h-4" />
        Save
      </Button>
      <Button onClick={onFormat} className="flex items-center gap-2">
        <Code className="w-4 h-4" />
        Format
      </Button>
      <div className="flex-1" />
      <ThemeToggle />
    </div>
  );
};`,
        pitfalls: [
          'Handle large file sizes',
          'Implement proper error handling',
          'Consider extension architecture',
        ],
      },
    ],
    repoLink: 'https://github.com/example/code-editor',
    demoLink: 'https://code-editor-demo.example.com',
  },
  'video-chat': {
    title: 'Video Chat App',
    description: 'Create a real-time video chat application using WebRTC and WebSocket signaling.',
    difficulty: 'expert',
    prerequisites: ['WebRTC', 'Socket.io', 'Media Devices API'],
    duration: '12-15 hours',
    techStack: ['React', 'TypeScript', 'WebRTC', 'Socket.io', 'Tailwind CSS'],
    steps: [
      {
        title: 'Setting up WebRTC and Signaling',
        description: 'Implement WebRTC peer connection and signaling server integration.',
        code: `interface SignalingMessage {
  type: 'offer' | 'answer' | 'candidate';
  payload: any;
  from: string;
  to: string;
}

class PeerConnection {
  private pc: RTCPeerConnection;
  private socket: Socket;
  private stream: MediaStream | null = null;

  constructor(socket: Socket) {
    this.socket = socket;
    this.pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        {
          urls: 'turn:your-turn-server.com',
          username: 'username',
          credential: 'credential',
        },
      ],
    });

    this.pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        this.socket.emit('signal', {
          type: 'candidate',
          payload: candidate,
        });
      }
    };

    this.pc.ontrack = (event) => {
      // Handle remote stream
    };
  }

  async startCall(remoteId: string) {
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);

    this.socket.emit('signal', {
      type: 'offer',
      payload: offer,
      to: remoteId,
    });
  }
}`,
        pitfalls: [
          'Handle ICE candidate gathering',
          'Implement TURN fallback',
          'Consider network changes',
        ],
      },
      {
        title: 'Building the Video Interface',
        description: 'Create the video chat interface with controls and settings.',
        code: `const VideoChat = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <div className="relative">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full rounded-lg"
        />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
          <Button
            onClick={() => setIsMuted(!isMuted)}
            variant={isMuted ? 'destructive' : 'default'}
          >
            {isMuted ? <MicOffIcon /> : <MicIcon />}
          </Button>
          <Button
            onClick={() => setIsVideoEnabled(!isVideoEnabled)}
            variant={!isVideoEnabled ? 'destructive' : 'default'}
          >
            {isVideoEnabled ? <VideoIcon /> : <VideoOffIcon />}
          </Button>
        </div>
      </div>
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full rounded-lg"
      />
    </div>
  );
};`,
        pitfalls: [
          'Handle device permissions',
          'Implement fallback UI',
          'Consider bandwidth limitations',
        ],
      },
      {
        title: 'Adding Chat and Screen Sharing',
        description: 'Implement text chat and screen sharing capabilities.',
        code: `const useScreenShare = () => {
  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      return stream;
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  return { startScreenShare };
};

const ChatPanel = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = (text: string) => {
    const message: ChatMessage = {
      id: nanoid(),
      text,
      sender: 'local',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, message]);
    socket.emit('chat-message', message);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>
      <div className="p-4 border-t">
        <form onSubmit={e => {
          e.preventDefault();
          sendMessage(input);
          setInput('');
        }}>
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
          />
        </form>
      </div>
    </div>
  );
};`,
        pitfalls: [
          'Handle screen share constraints',
          'Implement message persistence',
          'Consider UI responsiveness',
        ],
      },
    ],
    repoLink: 'https://github.com/example/video-chat',
    demoLink: 'https://video-chat-demo.example.com',
  },
};

const ProjectDetails = () => {
  const { projectId } = useParams();
  const project = projectId ? MOCK_PROJECT_DATA[projectId as keyof typeof MOCK_PROJECT_DATA] : null;
  const [isCompleted, setIsCompleted] = useState(false);
  const { getUserProgress, updateUserProgress } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchProgress = async () => {
      const userProgress = await getUserProgress();
      if (userProgress && projectId) {
        const level = Object.keys(userProgress).find(key => 
          userProgress[key][projectId]?.completed
        );
        setIsCompleted(!!level);
      }
    };
    fetchProgress();
  }, [projectId, getUserProgress]);

  const toggleCompletion = async () => {
    if (!projectId || !project) return;
    
    setIsUpdating(true);
    try {
      const newStatus = !isCompleted;
      const userProgress = await getUserProgress();
      
      // Get the project level directly from the current project's difficulty
      const projectLevel = project.difficulty;

      // Update the progress in Firebase
      const updatedProgress = {
        ...userProgress,
        [projectLevel]: {
          ...(userProgress[projectLevel] || {}),
          [projectId]: {
            completed: newStatus,
            completedAt: newStatus ? new Date().toISOString() : '',
          },
        },
      };

      await updateUserProgress(updatedProgress);
      setIsCompleted(newStatus);

      // Update localStorage for UI consistency
      const completedProjects = JSON.parse(localStorage.getItem('completedProjects') || '{}');
      completedProjects[projectId] = newStatus;
      localStorage.setItem('completedProjects', JSON.stringify(completedProjects));

      toast({
        title: newStatus ? 'Project Completed! 🎉' : 'Project Status Updated',
        description: newStatus 
          ? 'Great job! Your progress has been updated.' 
          : 'Project marked as incomplete.',
      });
    } catch (error) {
      console.error('Error updating project status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update project status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!project) {
    return (
      <div className="container py-12">
        <h1>Project not found</h1>
        <Link to="/" className="text-primary hover:underline">
          Return to homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="flex justify-between items-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>
        <Button
          onClick={toggleCompletion}
          variant={isCompleted ? "secondary" : "default"}
          className={`flex items-center gap-2 ${isCompleted ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}`}
          disabled={isUpdating}
        >
          <CheckCircle className={`h-4 w-4 ${isCompleted ? 'text-green-700' : ''}`} />
          {isUpdating ? 'Updating...' : isCompleted ? 'Completed' : 'Mark as Complete'}
        </Button>
      </div>

      <header className="mb-12">
        <h1 className="mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {project.title}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
          {project.description}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Duration</h3>
            </div>
            <p>{project.duration}</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Prerequisites</h3>
            </div>
            <ul className="list-disc list-inside">
              {project.prerequisites.map((prereq) => (
                <li key={prereq}>{prereq}</li>
              ))}
            </ul>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Code className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Tech Stack</h3>
            </div>
            <ul className="list-disc list-inside">
              {project.techStack.map((tech) => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Difficulty</h3>
            </div>
            <p>{project.difficulty}</p>
          </Card>
        </div>
      </header>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Step-by-Step Guide</h2>
        <div className="space-y-8">
          {project.steps.map((step, index) => (
            <Card key={index} className="p-6">
              <h3 className="text-xl font-semibold mb-4">
                {index + 1}. {step.title}
              </h3>
              <p className="mb-4 text-gray-600 dark:text-gray-300">{step.description}</p>
              {step.code && (
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4 overflow-x-auto">
                  <code>{step.code}</code>
                </pre>
              )}
              {step.pitfalls && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-orange-500 mb-2">
                    <AlertCircle className="h-5 w-5" />
                    <h4 className="font-semibold">Common Pitfalls</h4>
                  </div>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                    {step.pitfalls.map((pitfall, i) => (
                      <li key={i}>{pitfall}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          ))}
        </div>
      </section>

      <footer className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.open(project.repoLink, '_blank')}
        >
          <LinkIcon className="mr-2 h-4 w-4" />
          View Repository
        </Button>
        <Button
          className="w-full"
          onClick={() => window.open(project.demoLink, '_blank')}
        >
          <Play className="mr-2 h-4 w-4" />
          Live Demo
        </Button>
      </footer>
    </div>
  );
};

export default ProjectDetails;
