import { ReactNode } from 'react';
import ReduxProvider from './ReduxProvider';
import Layouts from '@/layouts/Layout';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

const Provider = ({ children }: { children: ReactNode }) => {
  return (
    <ReduxProvider>
      <NextThemesProvider>
        <Layouts>{children}</Layouts>
      </NextThemesProvider>
    </ReduxProvider>
  );
};

export default Provider;
