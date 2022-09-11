import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RoutesDefinition from 'routes';

const client = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={client}>
      <BrowserRouter>
        <RoutesDefinition />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
