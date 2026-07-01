'use client';

import { Box, Image, Tooltip } from '@chakra-ui/react';

// Map glass names to emoji representations
const glassEmoji: Record<string, string> = {
  'Highball glass': '🥛',
  'Highball Glass': '🥛',
  'Collins glass': '🥛',
  'Collins Glass': '🥛',
  'Old-fashioned glass': '🥃',
  'Old-Fashioned glass': '🥃',
  'Whiskey Glass': '🥃',
  'Cocktail glass': '🍸',
  'Cocktail Glass': '🍸',
  'Martini Glass': '🍸',
  'Champagne flute': '🥂',
  'Champagne Flute': '🥂',
  'Wine Glass': '🍷',
  'Wine glass': '🍷',
  'Shot glass': '🥃',
  'Shot Glass': '🥃',
  'Margarita glass': '🍹',
  'Margarita Glass': '🍹',
  'Margarita/Coupette glass': '🍹',
  'Hurricane glass': '🍹',
  'Hurricane Glass': '🍹',
  'Beer mug': '🍺',
  'Beer Glass': '🍺',
  'Beer pilsner': '🍺',
  'Pint glass': '🍺',
  'Irish coffee cup': '☕',
  'Coffee mug': '☕',
  'Coffee Mug': '☕',
  'Copper Mug': '🍺',
  'Mason jar': '🫙',
  'Jar': '🫙',
  'Punch bowl': '🍹',
  'Punch Bowl': '🍹',
  'Pitcher': '🫗',
  'Coupe Glass': '🍸',
  'Brandy snifter': '🥃',
  'Balloon Glass': '🍷',
  'Cordial glass': '🥃',
  'Parfait glass': '🍨',
  'Pousse cafe glass': '🥃',
  'White wine glass': '🍷',
  'Red wine glass': '🍷',
  'Nick and Nora Glass': '🍸',
};

// Default emoji for unknown glass types
const defaultEmoji = '🍹';

interface GlassIconProps {
  glass: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTooltip?: boolean;
}

const sizeMap = {
  sm: '1.2rem',
  md: '1.5rem',
  lg: '2rem',
  xl: '3rem',
};

export function GlassIcon({ glass, size = 'md', showTooltip = true }: GlassIconProps) {
  const emoji = glassEmoji[glass] || defaultEmoji;
  const fontSize = sizeMap[size];

  const icon = (
    <Box
      as="span"
      fontSize={fontSize}
      lineHeight={1}
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
    >
      {emoji}
    </Box>
  );

  if (showTooltip) {
    return (
      <Tooltip label={glass} placement="top" hasArrow>
        {icon}
      </Tooltip>
    );
  }

  return icon;
}

// Export the mapping for use elsewhere
export function getGlassEmoji(glass: string): string {
  return glassEmoji[glass] || defaultEmoji;
}
