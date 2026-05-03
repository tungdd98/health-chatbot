import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';

import { theme } from '../theme/theme';

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div>chatbot</div>
    </ThemeProvider>
  );
}

export default App;
