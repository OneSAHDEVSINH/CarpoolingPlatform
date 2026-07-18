import { createTheme } from '@mui/material/styles';

const getTheme = (mode) => {
  const isLight = mode === 'light';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#00BFA6',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#3F51B5',
        contrastText: '#FFFFFF',
      },
      success: {
        main: '#10B981',
      },
      error: {
        main: '#EF4444',
      },
      info: {
        main: '#3B82F6',
      },
      warning: {
        main: '#F59E0B',
      },
      accent: {
        main: '#FFB300',
      },
      background: {
        default: isLight ? '#F9FAFB' : '#121212',
        paper: isLight ? '#FFFFFF' : '#1E1E1E',
      },
    },
    typography: {
      fontFamily: "'Inter', sans-serif",
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            boxShadow: isLight 
              ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' 
              : '0 1px 3px 0 rgba(0, 0, 0, 0.5)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: isLight ? '1px solid #E5E7EB' : '1px solid #374151',
          },
          head: {
            fontWeight: 600,
            backgroundColor: isLight ? '#F3F4F6' : '#272727',
          },
        },
      },
    },
  });
};

export default getTheme;
