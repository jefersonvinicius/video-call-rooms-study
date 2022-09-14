import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecoilRoot } from 'recoil';
import RoutesDefinition from 'routes';
import { UserSocketProvider } from 'contexts/UserSocketContext';
import APIInterceptors from 'components/APIInterceptors';

const client = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={client}>
      <RecoilRoot>
        <UserSocketProvider>
          <>
            <APIInterceptors />
            <BrowserRouter>
              <RoutesDefinition />
            </BrowserRouter>
          </>
        </UserSocketProvider>
      </RecoilRoot>
    </QueryClientProvider>
  );
}

export default App;
