import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecoilRoot } from 'recoil';
import RoutesDefinition from 'routes';
import { UserSocketProvider } from 'contexts/UserSocketContext';
import APIInterceptors from 'components/APIInterceptors';
import { UserPeerConnectionProvider } from 'contexts/UserPeerConnection';

const client = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={client}>
      <RecoilRoot>
        <UserSocketProvider>
          <UserPeerConnectionProvider>
            <>
              <APIInterceptors />
              <BrowserRouter>
                <RoutesDefinition />
              </BrowserRouter>
            </>
          </UserPeerConnectionProvider>
        </UserSocketProvider>
      </RecoilRoot>
    </QueryClientProvider>
  );
}

export default App;
