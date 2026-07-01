'use client';

import { Box } from '@chakra-ui/react';
import { Slideshow } from '@/components/Slideshow';

export default function SlideshowPage() {
  return (
    <>
      {/* Black background that fills entire viewport including safe areas */}
      <Box
        position="fixed"
        top="-100px"
        left="-100px"
        right="-100px"
        bottom="-100px"
        bg="black"
        zIndex={-1}
      />
      <Slideshow />
    </>
  );
}
