'use client';

import { useState } from 'react';
import { HStack, Icon } from '@chakra-ui/react';
import { FaStar } from 'react-icons/fa';

interface StarRatingProps {
  /** Current rating, 0-5. */
  value: number;
  /** When provided, the stars are interactive. Called with 1-5, or 0 to clear. */
  onChange?: (rating: number) => void;
  /** Icon size (Chakra boxSize units). */
  size?: number;
  /** Spacing between stars (Chakra spacing units). */
  spacing?: number;
  color?: string;
  emptyColor?: string;
}

const STARS = [1, 2, 3, 4, 5];

export function StarRating({
  value,
  onChange,
  size = 4,
  spacing = 0.5,
  color = '#f59e0b',
  emptyColor = 'whiteAlpha.300',
}: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const interactive = typeof onChange === 'function';
  const display = interactive && hover !== null ? hover : value;

  return (
    <HStack
      spacing={spacing}
      onMouseLeave={interactive ? () => setHover(null) : undefined}
      role={interactive ? 'radiogroup' : undefined}
      aria-label={interactive ? 'Rating' : `Rated ${value} out of 5`}
    >
      {STARS.map((star) => (
        <Icon
          key={star}
          as={FaStar}
          boxSize={size}
          color={star <= display ? color : emptyColor}
          cursor={interactive ? 'pointer' : 'default'}
          transition="color 0.15s ease, transform 0.15s ease"
          _hover={interactive ? { transform: 'scale(1.15)' } : undefined}
          onMouseEnter={interactive ? () => setHover(star) : undefined}
          onClick={
            interactive
              ? (e) => {
                  e.stopPropagation();
                  // Clicking the current rating again clears it.
                  onChange!(value === star ? 0 : star);
                }
              : undefined
          }
          aria-label={interactive ? `Rate ${star} star${star > 1 ? 's' : ''}` : undefined}
        />
      ))}
    </HStack>
  );
}
