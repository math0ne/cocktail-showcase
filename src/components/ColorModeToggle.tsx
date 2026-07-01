'use client';

import { IconButton, useColorMode, Tooltip } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';

export function ColorModeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Tooltip label={colorMode === 'dark' ? 'Light mode' : 'Dark mode'}>
      <IconButton
        aria-label="Toggle color mode"
        icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
        onClick={toggleColorMode}
        variant="ghost"
        colorScheme="gray"
        size="md"
      />
    </Tooltip>
  );
}
