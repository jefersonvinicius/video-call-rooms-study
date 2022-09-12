import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecoilRoot } from 'recoil';
import RoutesDefinition from 'routes';

const client = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={client}>
      <RecoilRoot>
        <BrowserRouter>
          <RoutesDefinition />
        </BrowserRouter>
      </RecoilRoot>
    </QueryClientProvider>
  );
}

export default App;
