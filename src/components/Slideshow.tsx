'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Box,
  Flex,
  Text,
  IconButton,
  HStack,
  VStack,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  useDisclosure,
  Badge,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Switch,
  FormControl,
  FormLabel,
  Select,
  Divider,
} from '@chakra-ui/react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SettingsIcon,
  CloseIcon,
  InfoIcon,
} from '@chakra-ui/icons';

import { motion, AnimatePresence } from 'framer-motion';
import { useCocktails } from '@/hooks/useCocktails';
import { useStore } from '@/store/useStore';
import Link from 'next/link';
import type { CocktailMatch } from '@/types';
import { CocktailModal } from './CocktailModal';

const MotionBox = motion(Box);
const MotionImage = motion(Image);
const MotionText = motion(Text);
const MotionHStack = motion(HStack);
const MotionVStack = motion(VStack);

// Slide-in card animation variants (left side)
const cardVariants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    x: -30,
    transition: {
      duration: 0.3,
    },
  },
};

// Slide-in card animation variants (right side)
const cardVariantsRight = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    x: 30,
    transition: {
      duration: 0.3,
    },
  },
};

// Staggered text animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad
    },
  },
  exit: {
    opacity: 0,
    y: -15,
    filter: 'blur(4px)',
    transition: {
      duration: 0.3,
    },
  },
};

const badgeContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
  exit: { opacity: 0 },
};

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: { opacity: 0, scale: 0.9 },
};

// Different Ken Burns animation patterns - varied directions and zoom in/out
const kenBurnsVariants = [
  // Zoom in + move right-down
  { scale: [1, 1.12], x: ['0%', '4%'], y: ['0%', '3%'] },
  // Zoom out + move left-up
  { scale: [1.15, 1], x: ['4%', '0%'], y: ['3%', '0%'] },
  // Zoom in + move left-down
  { scale: [1, 1.1], x: ['0%', '-4%'], y: ['0%', '3%'] },
  // Zoom out + move right-up
  { scale: [1.12, 1], x: ['-4%', '0%'], y: ['3%', '0%'] },
  // Zoom in + move up (centering)
  { scale: [1, 1.15], x: ['0%', '0%'], y: ['3%', '-2%'] },
  // Zoom out + move down (centering)
  { scale: [1.15, 1], x: ['0%', '0%'], y: ['-2%', '3%'] },
  // Zoom in + diagonal top-left to bottom-right
  { scale: [1, 1.1], x: ['-3%', '3%'], y: ['-2%', '2%'] },
  // Zoom out + diagonal bottom-right to top-left
  { scale: [1.12, 1], x: ['3%', '-3%'], y: ['2%', '-2%'] },
  // Zoom in + move left (horizontal pan)
  { scale: [1, 1.08], x: ['3%', '-3%'], y: ['0%', '0%'] },
  // Zoom in + move right (horizontal pan)
  { scale: [1, 1.08], x: ['-3%', '3%'], y: ['0%', '0%'] },
  // Subtle zoom out + slight drift up
  { scale: [1.1, 1.02], x: ['2%', '-1%'], y: ['2%', '-1%'] },
  // Subtle zoom in + slight drift down
  { scale: [1.02, 1.1], x: ['-1%', '2%'], y: ['-1%', '2%'] },
];

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function Slideshow() {
  const { fullMatches, loading } = useCocktails();
  const slideShowSettings = useStore((state) => state.slideShowSettings);
  const setSlideShowInterval = useStore((state) => state.setSlideShowInterval);
  const setKenBurnsEnabled = useStore((state) => state.setKenBurnsEnabled);
  const setFilmGrainEnabled = useStore((state) => state.setFilmGrainEnabled);
  const setRetroFilterEnabled = useStore((state) => state.setRetroFilterEnabled);
  const setTransitionSpeed = useStore((state) => state.setTransitionSpeed);
  const triedCocktails = useStore((state) => state.triedCocktails);
  const heartedCocktails = useStore((state) => state.heartedCocktails);

  const { interval, kenBurnsEnabled, filmGrainEnabled, retroFilterEnabled, transitionSpeed } = slideShowSettings;

  // Detect if running as PWA (standalone mode)
  const [isPWA, setIsPWA] = useState(false);
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true;
    setIsPWA(isStandalone);
  }, []);

  // Track actual viewport height (fixes iOS/iPad height issues)
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  useEffect(() => {
    const updateHeight = () => {
      // Try multiple methods to get the most accurate height
      // Add 50px buffer to ensure we cover any safe area gaps
      const vh = Math.max(
        window.visualViewport?.height || 0,
        window.innerHeight,
        document.documentElement.clientHeight
      ) + 50;
      setViewportHeight(vh);
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    window.addEventListener('orientationchange', updateHeight);
    window.visualViewport?.addEventListener('resize', updateHeight);
    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('orientationchange', updateHeight);
      window.visualViewport?.removeEventListener('resize', updateHeight);
    };
  }, []);

  // Track if component is mounted (for portal)
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [timerReset, setTimerReset] = useState(0); // Used to reset auto-advance timer
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(true);
  const [progress, setProgress] = useState(0);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const progressRef = useRef<number>(0);
  const { isOpen: showSettings, onOpen: openSettings, onClose: closeSettings } = useDisclosure();
  const { isOpen: showDetails, onOpen: openDetails, onClose: closeDetailsModal } = useDisclosure();

  const resetTimer = useCallback(() => {
    setTimerReset((t) => t + 1);
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, []);

  // Listen for fullscreen changes (e.g., user presses Escape)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Auto-enter fullscreen on mount (skip in PWA mode - already fullscreen)
  useEffect(() => {
    if (isPWA) {
      // In PWA mode, we're already "fullscreen" via the overlay
      setShowFullscreenPrompt(false);
      setIsFullscreen(true);
      return;
    }

    const enterFullscreen = async () => {
      try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
          setShowFullscreenPrompt(false);
        }
      } catch (err) {
        // Auto-fullscreen failed, keep prompt visible for user gesture
        console.log('Auto-fullscreen not supported:', err);
      }
    };
    enterFullscreen();
  }, [isPWA]);

  // Handle fullscreen prompt tap
  const handleFullscreenPrompt = useCallback(async () => {
    if (isPWA) {
      // Already fullscreen in PWA mode
      setShowFullscreenPrompt(false);
      return;
    }
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch (err) {
      console.log('Fullscreen error:', err);
    }
    setShowFullscreenPrompt(false);
  }, [isPWA]);

  // Exit fullscreen and navigate back
  const handleExit = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.log('Exit fullscreen error:', err);
    }
    window.location.href = '/';
  }, []);

  // Wake Lock to prevent device sleep
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.log('Wake Lock not supported or failed:', err);
      }
    };

    requestWakeLock();

    // Re-request wake lock when page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, []);

  // Shuffle cocktails once when they load
  const shuffledMatches = useMemo(() => {
    return shuffleArray(fullMatches);
  }, [fullMatches]);

  const currentMatch: CocktailMatch | undefined = shuffledMatches[currentIndex];
  const nextIndex = (currentIndex + 1) % shuffledMatches.length;
  const nextMatch: CocktailMatch | undefined = shuffledMatches[nextIndex];

  // Get a consistent Ken Burns variant for each slide
  const kenBurnsVariant = useMemo(() => {
    return kenBurnsVariants[currentIndex % kenBurnsVariants.length];
  }, [currentIndex]);

  // Transition duration based on speed setting
  const transitionDuration = useMemo(() => {
    switch (transitionSpeed) {
      case 'slow': return 1.5;
      case 'fast': return 0.5;
      default: return 1;
    }
  }, [transitionSpeed]);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % shuffledMatches.length);
  }, [shuffledMatches.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + shuffledMatches.length) % shuffledMatches.length);
  }, [shuffledMatches.length]);

  const closeDetails = useCallback(() => {
    closeDetailsModal();
  }, [closeDetailsModal]);

  // Auto-advance (pause when modal is open, reset on manual navigation)
  useEffect(() => {
    if (showDetails || shuffledMatches.length <= 1) return;

    const timer = setInterval(goNext, interval * 1000);
    return () => clearInterval(timer);
  }, [showDetails, interval, shuffledMatches.length, goNext, timerReset]);

  // Progress bar animation
  useEffect(() => {
    if (showDetails || shuffledMatches.length <= 1) {
      setProgress(0);
      return;
    }

    // Reset progress at the start of each slide
    setProgress(0);
    progressRef.current = 0;

    let animationId: number;
    const startTime = performance.now();
    const duration = interval * 1000;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);
      progressRef.current = newProgress;

      if (newProgress < 100) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [showDetails, interval, shuffledMatches.length, currentIndex, timerReset]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showDetails) return; // Don't navigate when modal is open
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'Escape') openSettings();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev, openSettings, showDetails]);

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Only prevent default if we're in a swipe gesture
    if (touchStart !== null) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;

    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        goNext(); // Swipe left = next
      } else {
        goPrev(); // Swipe right = prev
      }
      resetTimer(); // Reset auto-advance timer after swipe
    }
    setTouchStart(null);
  };

  if (loading) {
    return (
      <Flex h="100vh" align="center" justify="center" bg="black">
        <Text color="white" fontSize="xl">
          Loading cocktails...
        </Text>
      </Flex>
    );
  }

  if (shuffledMatches.length === 0) {
    return (
      <Flex h="100vh" align="center" justify="center" bg="black" direction="column" gap={4}>
        <Text color="white" fontSize="xl">
          No cocktails available to show.
        </Text>
        <Link href="/" passHref legacyBehavior>
          <Box
            as="a"
            color="teal.300"
            fontSize="lg"
            textDecoration="underline"
            _hover={{ color: 'teal.200' }}
          >
            Add more ingredients
          </Box>
        </Link>
      </Flex>
    );
  }

  const cocktail = currentMatch.cocktail;

  // Use portal to render directly into body, bypassing all parent constraints
  const slideshowContent = (
    <div
      style={{
        position: 'fixed',
        top: '-50px',
        left: '-50px',
        right: '-50px',
        bottom: '-50px',
        width: 'calc(100vw + 100px)',
        height: 'calc(100vh + 100px)',
        backgroundColor: '#000',
        zIndex: 9999,
        overflow: 'hidden',
        touchAction: 'manipulation',
        overscrollBehavior: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      } as React.CSSProperties}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
    <Box
      position="absolute"
      top="50px"
      left="50px"
      right="50px"
      bottom="50px"
      overflow="hidden"
    >
      {/* Progress Bar - Glassmorphism Style */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        h="3px"
        bg="rgba(255,255,255,0.1)"
        backdropFilter="blur(8px)"
        zIndex={200}
        overflow="hidden"
      >
        <Box
          h="100%"
          bg="linear-gradient(90deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.5) 100%)"
          style={{ width: `${progress}%` }}
          boxShadow="0 0 8px rgba(255,255,255,0.2)"
        />
      </Box>

      {/* Blurred Background */}
      <AnimatePresence mode="wait">
        <MotionBox
          key={cocktail.id + '-bg'}
          position="absolute"
          inset={-20}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: transitionDuration * 1.2, ease: [0.4, 0, 0.2, 1] }}
          pointerEvents="none"
        >
          <Box
            position="absolute"
            inset={0}
            bgImage={`url(${cocktail.thumbnail})`}
            bgSize="cover"
            bgPosition="center"
            filter="blur(40px) saturate(1.2)"
            transform="scale(1.2)"
          />
          <Box
            position="absolute"
            inset={0}
            bg="blackAlpha.600"
          />
        </MotionBox>
      </AnimatePresence>

      {/* Main Image with Ken Burns effect */}
      <AnimatePresence mode="wait">
        <MotionBox
          key={cocktail.id + '-main'}
          position="absolute"
          inset={0}
          w="100%"
          h="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: transitionDuration, ease: [0.4, 0, 0.2, 1] }}
          pointerEvents="none"
        >
          <MotionBox
            position="relative"
            initial={kenBurnsEnabled ? {
              scale: kenBurnsVariant.scale[0],
              x: kenBurnsVariant.x[0],
              y: kenBurnsVariant.y[0],
            } : { scale: 1, x: 0, y: 0 }}
            animate={kenBurnsEnabled ? {
              scale: kenBurnsVariant.scale[1],
              x: kenBurnsVariant.x[1],
              y: kenBurnsVariant.y[1],
            } : { scale: 1, x: 0, y: 0 }}
            transition={{
              duration: kenBurnsEnabled ? interval : 0,
              ease: 'linear',
            }}
          >
            <Image
              src={cocktail.thumbnail}
              alt={cocktail.name}
              h="85vh"
              w="auto"
              objectFit="contain"
              borderRadius="xl"
              boxShadow="dark-lg"
              filter={retroFilterEnabled ? 'blur(0.3px) saturate(0.7) contrast(1.3) brightness(1.1) sepia(0.2)' : 'none'}
            />
            {/* Vintage overlay - vignette + warm tint */}
            {retroFilterEnabled && (
              <Box
                position="absolute"
                inset={0}
                borderRadius="xl"
                pointerEvents="none"
                sx={{
                  background: `
                    radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0,0,0,0.4) 100%),
                    linear-gradient(0deg, rgba(153,119,34,0.15) 0%, rgba(153,119,34,0.15) 100%)
                  `,
                }}
              />
            )}
          </MotionBox>
        </MotionBox>
      </AnimatePresence>

      {/* Gradient overlay for text readability */}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        h="50%"
        bgGradient="linear(to-t, blackAlpha.900 0%, blackAlpha.700 30%, transparent 100%)"
        pointerEvents="none"
      />

      {/* Film Grain Overlay */}
      {filmGrainEnabled && (
        <Box
          position="absolute"
          inset={0}
          pointerEvents="none"
          zIndex={50}
          opacity={0.4}
          mixBlendMode="overlay"
          sx={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '150px 150px',
        }}
      />
      )}

      {/* Content Card - Glassmorphism with slide-in */}
      <AnimatePresence mode="wait">
        <MotionBox
          key={cocktail.id + '-content'}
          position="absolute"
          left={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          pointerEvents="none"
          bg="whiteAlpha.100"
          backdropFilter="blur(20px)"
          border="1px solid"
          borderColor="whiteAlpha.200"
          borderLeft="none"
          borderBottomLeftRadius={0}
          borderTopLeftRadius={0}
          borderBottomRightRadius="2xl"
          borderTopRightRadius="2xl"
          boxShadow="8px 0 32px rgba(0, 0, 0, 0.3)"
          sx={{
            bottom: { base: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)', md: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' },
            paddingLeft: { base: '1.5rem', md: '2rem' },
            paddingRight: { base: '1.5rem', md: '2rem' },
            paddingBottom: { base: '1.5rem', md: '2rem' },
            paddingTop: { base: '1.5rem', md: '2rem' },
          }}
        >
          <VStack align="start" spacing={4} maxW="700px">
            {/* Title with status icons */}
            <HStack spacing={3} align="center">
              <MotionText
                variants={itemVariants}
                fontSize={{ base: '2xl', md: '4xl', lg: '5xl' }}
                fontWeight="bold"
                color="white"
                lineHeight="1.1"
              >
                {cocktail.name}
              </MotionText>
            </HStack>

            {/* Badges */}
            <MotionHStack
              spacing={2}
              flexWrap="wrap"
              align="center"
              variants={containerVariants}
            >
              {triedCocktails.includes(cocktail.id) && (
                <MotionBox variants={badgeVariants}>
                  <Badge
                    colorScheme="green"
                    fontSize={{ base: 'xs', md: 'sm' }}
                    px={2}
                    py={1}
                  >
                    Tried
                  </Badge>
                </MotionBox>
              )}
              {heartedCocktails.includes(cocktail.id) && (
                <MotionBox variants={badgeVariants}>
                  <Badge
                    colorScheme="red"
                    fontSize={{ base: 'xs', md: 'sm' }}
                    px={2}
                    py={1}
                  >
                    Liked
                  </Badge>
                </MotionBox>
              )}
              <MotionBox variants={badgeVariants}>
                <Badge
                  colorScheme="purple"
                  fontSize={{ base: 'xs', md: 'sm' }}
                  px={2}
                  py={1}
                >
                  {cocktail.category}
                </Badge>
              </MotionBox>
              <MotionBox variants={badgeVariants}>
                <Badge
                  colorScheme="blue"
                  fontSize={{ base: 'xs', md: 'sm' }}
                  px={2}
                  py={1}
                >
                  {cocktail.glass}
                </Badge>
              </MotionBox>
              {cocktail.tags.map((tag) => (
                <MotionBox key={tag} variants={badgeVariants}>
                  <Badge
                    colorScheme="teal"
                    fontSize={{ base: 'xs', md: 'sm' }}
                    px={2}
                    py={1}
                  >
                    {tag}
                  </Badge>
                </MotionBox>
              ))}
            </MotionHStack>

            {/* Ingredients */}
            <MotionVStack align="start" spacing={1} variants={itemVariants}>
              {cocktail.ingredients.map((ing, index) => (
                <Text
                  key={`${ing.name}-${index}`}
                  color="whiteAlpha.900"
                  fontSize={{ base: 'sm', md: 'md' }}
                >
                  {ing.measure && `${ing.measure} `}
                  {ing.name}
                </Text>
              ))}
            </MotionVStack>
          </VStack>
        </MotionBox>
      </AnimatePresence>

      {/* Navigation Controls - Glassmorphism Style */}
      <HStack
        position="absolute"
        spacing={3}
        zIndex={100}
        py={3}
        pl={4}
        pr={6}
        mr={-4}
        bg="whiteAlpha.100"
        backdropFilter="blur(20px)"
        borderTopLeftRadius="full"
        borderBottomLeftRadius="full"
        borderTopRightRadius={0}
        borderBottomRightRadius={0}
        border="1px solid"
        borderRight="none"
        borderColor="whiteAlpha.200"
        boxShadow="-8px 0 32px rgba(0, 0, 0, 0.3)"
        sx={{
          top: { base: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)', md: 'calc(env(safe-area-inset-top, 0px) + 1rem)' },
          right: 0,
        }}
      >
        <IconButton
          aria-label="Exit Slideshow"
          icon={<CloseIcon boxSize={4} color="white" />}
          onClick={(e) => { e.stopPropagation(); handleExit(); }}
          bg="whiteAlpha.100"
          backdropFilter="blur(8px)"
          border="1px solid"
          borderColor="whiteAlpha.200"
          _hover={{ bg: 'whiteAlpha.300', borderColor: 'whiteAlpha.400' }}
          _active={{ bg: 'whiteAlpha.400' }}
          transition="all 0.2s ease"
          size="lg"
          isRound
        />
        <IconButton
          aria-label="Previous"
          icon={<ChevronLeftIcon boxSize={6} color="white" />}
          onClick={(e) => { e.stopPropagation(); goPrev(); resetTimer(); }}
          bg="whiteAlpha.100"
          backdropFilter="blur(8px)"
          border="1px solid"
          borderColor="whiteAlpha.200"
          _hover={{ bg: 'whiteAlpha.300', borderColor: 'whiteAlpha.400' }}
          _active={{ bg: 'whiteAlpha.400' }}
          transition="all 0.2s ease"
          size="lg"
          isRound
        />
        <IconButton
          aria-label="Next"
          icon={<ChevronRightIcon boxSize={6} color="white" />}
          onClick={(e) => { e.stopPropagation(); goNext(); resetTimer(); }}
          bg="whiteAlpha.100"
          backdropFilter="blur(8px)"
          border="1px solid"
          borderColor="whiteAlpha.200"
          _hover={{ bg: 'whiteAlpha.300', borderColor: 'whiteAlpha.400' }}
          _active={{ bg: 'whiteAlpha.400' }}
          transition="all 0.2s ease"
          size="lg"
          isRound
        />
        <IconButton
          aria-label="View Instructions"
          icon={<InfoIcon boxSize={5} color="white" />}
          onClick={(e) => { e.stopPropagation(); openDetails(); }}
          bg="whiteAlpha.100"
          backdropFilter="blur(8px)"
          border="1px solid"
          borderColor="whiteAlpha.200"
          _hover={{ bg: 'whiteAlpha.300', borderColor: 'whiteAlpha.400' }}
          _active={{ bg: 'whiteAlpha.400' }}
          transition="all 0.2s ease"
          size="lg"
          isRound
        />
        <IconButton
          aria-label="Settings"
          icon={<SettingsIcon color="white" />}
          onClick={(e) => { e.stopPropagation(); openSettings(); }}
          bg="whiteAlpha.100"
          backdropFilter="blur(8px)"
          border="1px solid"
          borderColor="whiteAlpha.200"
          _hover={{ bg: 'whiteAlpha.300', borderColor: 'whiteAlpha.400' }}
          _active={{ bg: 'whiteAlpha.400' }}
          transition="all 0.2s ease"
          size="lg"
          isRound
        />
      </HStack>

      {/* Next Drink Preview - Bottom Right */}
      {shuffledMatches.length > 1 && (
        <AnimatePresence mode="wait">
          {nextMatch && (
            <MotionBox
              key={nextMatch.cocktail.id + '-preview'}
              position="absolute"
              right={0}
              zIndex={100}
              py={3}
              pl={4}
              pr={6}
              bg="whiteAlpha.100"
              backdropFilter="blur(20px)"
              borderTopLeftRadius="2xl"
              borderBottomLeftRadius="2xl"
              border="1px solid"
              borderRight="none"
              borderColor="whiteAlpha.200"
              boxShadow="-8px 0 32px rgba(0, 0, 0, 0.3)"
              variants={cardVariantsRight}
              initial="hidden"
              animate="visible"
              exit="exit"
              sx={{
                bottom: { base: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)', md: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' },
              }}
              cursor="pointer"
              onClick={(e) => { e.stopPropagation(); goNext(); resetTimer(); }}
              _hover={{ bg: 'whiteAlpha.200' }}
            >
              <HStack spacing={3}>
                <Box
                  w={{ base: '50px', md: '60px' }}
                  h={{ base: '50px', md: '60px' }}
                  borderRadius="lg"
                  overflow="hidden"
                  flexShrink={0}
                >
                  <Image
                    src={nextMatch.cocktail.thumbnail}
                    alt={nextMatch.cocktail.name}
                    w="100%"
                    h="100%"
                    objectFit="cover"
                  />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text
                    color="whiteAlpha.600"
                    fontSize={{ base: 'xs', md: 'sm' }}
                    fontWeight="medium"
                  >
                    Up Next
                  </Text>
                  <Text
                    color="white"
                    fontSize={{ base: 'sm', md: 'md' }}
                    fontWeight="semibold"
                    noOfLines={1}
                    maxW={{ base: '120px', md: '160px' }}
                  >
                    {nextMatch.cocktail.name}
                  </Text>
                </VStack>
              </HStack>
            </MotionBox>
          )}
        </AnimatePresence>
      )}

      {/* Fullscreen Prompt (for iOS/iPad) - Glassmorphism Style */}
      {showFullscreenPrompt && !isFullscreen && (
        <Box
          position="absolute"
          inset={0}
          bg="rgba(0, 0, 0, 0.7)"
          backdropFilter="blur(8px)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={200}
          onClick={handleFullscreenPrompt}
          cursor="pointer"
        >
          <VStack
            spacing={4}
            p={8}
            bg="whiteAlpha.100"
            backdropFilter="blur(16px)"
            borderRadius="2xl"
            border="1px solid"
            borderColor="whiteAlpha.200"
            boxShadow="0 8px 32px rgba(0, 0, 0, 0.4)"
          >
            <Text color="white" fontSize="2xl" fontWeight="bold" textAlign="center">
              Tap to Enter Fullscreen
            </Text>
            <Text color="whiteAlpha.700" fontSize="md" textAlign="center">
              For the best experience
            </Text>
          </VStack>
        </Box>
      )}

      {/* Settings Modal */}
      <Modal isOpen={showSettings} onClose={closeSettings} isCentered size="md">
        <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.700" />
        <ModalContent
          bg="rgba(30, 30, 30, 0.95)"
          backdropFilter="blur(20px)"
          border="1px solid"
          borderColor="whiteAlpha.200"
          borderRadius="2xl"
          mx={4}
        >
          <ModalHeader color="white" pb={2}>Slideshow Settings</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody pb={6}>
            <VStack align="stretch" spacing={5}>
              {/* Slide Duration */}
              <Box>
                <Text color="white" mb={3} fontWeight="medium">
                  Slide Duration: {interval}s
                </Text>
                <Slider
                  value={interval}
                  min={5}
                  max={30}
                  step={1}
                  onChange={setSlideShowInterval}
                >
                  <SliderTrack bg="whiteAlpha.300">
                    <SliderFilledTrack bg="teal.500" />
                  </SliderTrack>
                  <SliderThumb boxSize={5} />
                </Slider>
              </Box>

              <Divider borderColor="whiteAlpha.200" />

              {/* Animation Settings */}
              <Text color="white" fontWeight="medium" fontSize="sm" textTransform="uppercase" letterSpacing="wide">
                Animations
              </Text>

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel color="white" mb={0} fontWeight="normal">
                  Ken Burns Effect
                </FormLabel>
                <Switch
                  isChecked={kenBurnsEnabled}
                  onChange={(e) => setKenBurnsEnabled(e.target.checked)}
                  colorScheme="teal"
                  size="md"
                />
              </FormControl>

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel color="white" mb={0} fontWeight="normal">
                  Film Grain
                </FormLabel>
                <Switch
                  isChecked={filmGrainEnabled}
                  onChange={(e) => setFilmGrainEnabled(e.target.checked)}
                  colorScheme="teal"
                  size="md"
                />
              </FormControl>

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel color="white" mb={0} fontWeight="normal">
                  Retro Film Filter
                </FormLabel>
                <Switch
                  isChecked={retroFilterEnabled}
                  onChange={(e) => setRetroFilterEnabled(e.target.checked)}
                  colorScheme="teal"
                  size="md"
                />
              </FormControl>

              <FormControl>
                <FormLabel color="white" fontWeight="normal">
                  Transition Speed
                </FormLabel>
                <Select
                  value={transitionSpeed}
                  onChange={(e) => setTransitionSpeed(e.target.value as 'slow' | 'normal' | 'fast')}
                  bg="whiteAlpha.100"
                  border="1px solid"
                  borderColor="whiteAlpha.300"
                  color="white"
                  _hover={{ borderColor: 'whiteAlpha.400' }}
                  _focus={{ borderColor: 'teal.500', boxShadow: '0 0 0 1px var(--chakra-colors-teal-500)' }}
                >
                  <option value="slow" style={{ background: '#1a1a1a' }}>Slow</option>
                  <option value="normal" style={{ background: '#1a1a1a' }}>Normal</option>
                  <option value="fast" style={{ background: '#1a1a1a' }}>Fast</option>
                </Select>
              </FormControl>

              <Divider borderColor="whiteAlpha.200" />

              {/* Keyboard Shortcuts */}
              <Text color="whiteAlpha.600" fontSize="sm">
                Keyboard: Arrow keys to navigate
              </Text>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <CocktailModal
        match={currentMatch}
        isOpen={showDetails}
        onClose={closeDetails}
      />
    </Box>
    </div>
  );

  // Render via portal directly into body to bypass any parent constraints
  if (!mounted) return null;
  return createPortal(slideshowContent, document.body);
}
