import { Outlet } from 'react-router';
import { ToastContainer } from './Toast';

export function RootLayout() {
  return (
    <>
      <ToastContainer />
      <Outlet />
    </>
  );
}
