'use client';

import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider, extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  styles: {
    global: {
      body: {
        bg: '#0d0d0d',
        color: 'gray.100',
      },
    },
  },
  colors: {
    // Revolut purple palette
    brand: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
    },
    purple: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
    },
    // Deeper grays for dark theme
    gray: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b',
      950: '#09090b',
    },
  },
  semanticTokens: {
    colors: {
      'bg.page': '#0d0d0d',
      'bg.surface': '#18181b',
      'bg.card': '#121214',
      'bg.subtle': '#27272a',
      'bg.muted': '#3f3f46',
      'border.default': '#27272a',
      'border.subtle': '#1f1f23',
      'text.primary': 'gray.100',
      'text.secondary': 'gray.400',
      'text.muted': 'gray.500',
      'accent.purple': 'purple.500',
      'accent.green': 'green.400',
      'accent.orange': 'orange.400',
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'medium',
        borderRadius: 'xl',
      },
      variants: {
        solid: {
          bg: 'purple.600',
          color: 'white',
          _hover: {
            bg: 'purple.500',
          },
          _active: {
            bg: 'purple.700',
          },
        },
        outline: {
          borderColor: 'whiteAlpha.200',
          color: 'gray.100',
          _hover: {
            bg: 'whiteAlpha.100',
          },
        },
        ghost: {
          color: 'gray.100',
          _hover: {
            bg: 'whiteAlpha.100',
          },
        },
      },
    },
    Input: {
      variants: {
        filled: {
          field: {
            bg: 'gray.800',
            borderRadius: 'xl',
            _hover: {
              bg: 'gray.700',
            },
            _focus: {
              bg: 'gray.800',
              borderColor: 'purple.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)',
            },
          },
        },
      },
      defaultProps: {
        variant: 'filled',
      },
    },
    Badge: {
      baseStyle: {
        textTransform: 'none',
        fontWeight: 'medium',
        borderRadius: 'full',
      },
    },
    Tag: {
      baseStyle: {
        container: {
          borderRadius: 'full',
        },
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          bg: '#0d0d0d',
          borderRadius: '2xl',
        },
        overlay: {
          bg: 'blackAlpha.800',
          backdropFilter: 'blur(8px)',
        },
      },
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>{children}</ChakraProvider>
    </CacheProvider>
  );
}
