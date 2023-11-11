import { Box } from '@mui/material';
import Nav from './nav';

export default function Layout({ children }) {
  return (
    <Box sx={{ display: 'flex' }}>
      <Nav />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
}
