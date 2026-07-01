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
    global: (props: { colorMode: string }) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
        color: props.colorMode === 'dark' ? 'gray.100' : 'gray.800',
      },
    }),
  },
  colors: {
    // Softer gray palette for less contrast
    gray: {
      50: '#f7f7f8',
      100: '#e8e8ea',
      200: '#d1d1d6',
      300: '#a9a9b2',
      400: '#7c7c87',
      500: '#5c5c66',
      600: '#46464f',
      700: '#33333a',
      800: '#242429',
      900: '#18181b',
      950: '#0f0f11',
    },
    brand: {
      50: '#e6fffa',
      100: '#b2f5ea',
      200: '#81e6d9',
      300: '#4fd1c5',
      400: '#38b2ac',
      500: '#319795',
      600: '#2c7a7b',
      700: '#285e61',
      800: '#234e52',
      900: '#1d4044',
    },
  },
  semanticTokens: {
    colors: {
      // Background colors
      'bg.page': {
        default: 'gray.50',
        _dark: 'gray.900',
      },
      'bg.surface': {
        default: 'white',
        _dark: 'gray.800',
      },
      'bg.subtle': {
        default: 'gray.100',
        _dark: 'gray.700',
      },
      'bg.muted': {
        default: 'gray.200',
        _dark: 'gray.600',
      },
      // Border colors
      'border.default': {
        default: 'gray.200',
        _dark: 'gray.700',
      },
      'border.subtle': {
        default: 'gray.100',
        _dark: 'gray.750',
      },
      // Text colors
      'text.primary': {
        default: 'gray.800',
        _dark: 'gray.100',
      },
      'text.secondary': {
        default: 'gray.600',
        _dark: 'gray.400',
      },
      'text.muted': {
        default: 'gray.500',
        _dark: 'gray.500',
      },
      // Accent colors (softer in dark mode)
      'accent.teal': {
        default: 'teal.600',
        _dark: 'teal.300',
      },
      'accent.green': {
        default: 'green.600',
        _dark: 'green.400',
      },
      'accent.orange': {
        default: 'orange.600',
        _dark: 'orange.400',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'medium',
      },
    },
    Badge: {
      baseStyle: (props: { colorMode: string }) => ({
        textTransform: 'none',
        fontWeight: 'medium',
        opacity: props.colorMode === 'dark' ? 0.9 : 1,
      }),
    },
    Tag: {
      baseStyle: (props: { colorMode: string }) => ({
        opacity: props.colorMode === 'dark' ? 0.95 : 1,
      }),
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
