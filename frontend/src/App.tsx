import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { QueryClientProvider, AuthProvider, SidebarProvider } from './contexts';
import { SocketProvider } from './contexts/SocketProvider';

function App() {
  return (
    <QueryClientProvider>
      <AuthProvider>
        <SocketProvider>
          <SidebarProvider>
            <RouterProvider router={router} />
          </SidebarProvider>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
