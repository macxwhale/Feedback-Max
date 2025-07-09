
# Component Documentation

This document provides documentation for React components and their usage patterns.

## Component Architecture

Components are organized into the following categories:

- **UI Components**: Reusable presentational components
- **Business Components**: Components with business logic
- **Layout Components**: Components for page structure
- **Feature Components**: Components for specific features

## Design Principles

### 1. Single Responsibility Principle
Each component should have a single, well-defined purpose.

```typescript
// Good: Focused component
function UserAvatar({ user }: { user: User }) {
  return <img src={user.avatar} alt={user.name} className="rounded-full" />;
}

// Bad: Component doing too much
function UserProfile({ user }: { user: User }) {
  // Handles avatar, profile editing, notifications, etc.
}
```

### 2. Composition over Inheritance
Use composition to build complex components from simpler ones.

```typescript
function UserCard({ user }: { user: User }) {
  return (
    <Card>
      <UserAvatar user={user} />
      <UserInfo user={user} />
      <UserActions user={user} />
    </Card>
  );
}
```

### 3. Props Interface Design
Design clear, minimal props interfaces.

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}
```

## Component Patterns

### 1. Container/Presenter Pattern
Separate business logic from presentation.

```typescript
// Container Component (Business Logic)
function UserListContainer() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUsers().then(setUsers).finally(() => setLoading(false));
  }, []);
  
  return <UserListPresenter users={users} loading={loading} />;
}

// Presenter Component (Pure UI)
function UserListPresenter({ users, loading }: { users: User[]; loading: boolean }) {
  if (loading) return <Spinner />;
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}><UserCard user={user} /></li>
      ))}
    </ul>
  );
}
```

### 2. Render Props Pattern
Share code between components using render props.

```typescript
interface DataFetcherProps<T> {
  url: string;
  children: (data: T | null, loading: boolean, error: Error | null) => React.ReactNode;
}

function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    fetch(url)
      .then(response => response.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);
  
  return <>{children(data, loading, error)}</>;
}

// Usage
function UserProfile({ userId }: { userId: string }) {
  return (
    <DataFetcher<User> url={`/api/users/${userId}`}>
      {(user, loading, error) => {
        if (loading) return <Spinner />;
        if (error) return <ErrorMessage error={error} />;
        if (!user) return <NotFound />;
        return <UserCard user={user} />;
      }}
    </DataFetcher>
  );
}
```

### 3. Custom Hooks Pattern
Extract component logic into reusable hooks.

```typescript
function useUserData(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    setLoading(true);
    fetchUser(userId)
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);
  
  return { user, loading, error };
}

// Usage in component
function UserProfile({ userId }: { userId: string }) {
  const { user, loading, error } = useUserData(userId);
  
  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!user) return <NotFound />;
  
  return <UserCard user={user} />;
}
```

## Performance Optimization

### 1. React.memo for Pure Components
Prevent unnecessary re-renders for pure components.

```typescript
const UserCard = React.memo(function UserCard({ user }: { user: User }) {
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
});
```

### 2. useMemo for Expensive Calculations
Memoize expensive calculations.

```typescript
function UserAnalytics({ users }: { users: User[] }) {
  const analytics = useMemo(() => {
    return calculateUserAnalytics(users); // Expensive operation
  }, [users]);
  
  return <AnalyticsChart data={analytics} />;
}
```

### 3. useCallback for Event Handlers
Prevent child re-renders caused by new function references.

```typescript
function UserList({ users }: { users: User[] }) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const handleUserSelect = useCallback((user: User) => {
    setSelectedUser(user);
  }, []);
  
  return (
    <div>
      {users.map(user => (
        <UserCard 
          key={user.id} 
          user={user} 
          onSelect={handleUserSelect}
        />
      ))}
    </div>
  );
}
```

## Testing Components

### Unit Testing with React Testing Library

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com'
  };
  
  it('renders user information', () => {
    render(<UserCard user={mockUser} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });
  
  it('calls onSelect when clicked', () => {
    const onSelect = jest.fn();
    render(<UserCard user={mockUser} onSelect={onSelect} />);
    
    fireEvent.click(screen.getByTestId('user-card'));
    
    expect(onSelect).toHaveBeenCalledWith(mockUser);
  });
});
```

## Accessibility Guidelines

### 1. Semantic HTML
Use appropriate HTML elements for better accessibility.

```typescript
function Button({ children, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className="btn"
      {...props}
    >
      {children}
    </button>
  );
}
```

### 2. ARIA Labels
Provide appropriate ARIA labels for screen readers.

```typescript
function SearchInput({ onSearch }: { onSearch: (query: string) => void }) {
  return (
    <input
      type="search"
      aria-label="Search users"
      placeholder="Search..."
      onChange={(e) => onSearch(e.target.value)}
    />
  );
}
```

### 3. Keyboard Navigation
Ensure components are keyboard accessible.

```typescript
function Modal({ isOpen, onClose, children }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
```

## Component Documentation Template

Use this template for documenting new components:

```typescript
/**
 * UserCard - Displays user information in a card format
 * 
 * @param user - User object containing id, name, email
 * @param onSelect - Optional callback when card is clicked
 * @param variant - Visual variant of the card
 * 
 * @example
 * ```tsx
 * <UserCard 
 *   user={{ id: '1', name: 'John', email: 'john@example.com' }}
 *   onSelect={(user) => console.log('Selected:', user)}
 *   variant="compact"
 * />
 * ```
 */
interface UserCardProps {
  user: User;
  onSelect?: (user: User) => void;
  variant?: 'default' | 'compact' | 'detailed';
}

export function UserCard({ user, onSelect, variant = 'default' }: UserCardProps) {
  // Component implementation
}
```
