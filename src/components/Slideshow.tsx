'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  Button,
  Icon,
} from '@chakra-ui/react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SettingsIcon,
  CloseIcon,
  InfoIcon,
} from '@chakra-ui/icons';
import { FaExpand, FaCompress } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useCocktails } from '@/hooks/useCocktails';
import { useStore } from '@/store/useStore';
import Link from 'next/link';
import type { CocktailMatch } from '@/types';
import { CocktailModal } from './CocktailModal';

const MotionBox = motion(Box);
const MotionImage = motion(Image);

// Different Ken Burns animation patterns
const kenBurnsVariants = [
  { scale: [1, 1.15], x: ['0%', '5%'], y: ['0%', '3%'] },
  { scale: [1.1, 1], x: ['5%', '0%'], y: ['3%', '0%'] },
  { scale: [1, 1.12], x: ['0%', '-5%'], y: ['0%', '5%'] },
  { scale: [1.08, 1], x: ['-3%', '0%'], y: ['5%', '0%'] },
  { scale: [1, 1.1], x: ['0%', '3%'], y: ['0%', '-3%'] },
  { scale: [1.15, 1.05], x: ['5%', '-2%'], y: ['-3%', '2%'] },
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
  const interval = useStore((state) => state.slideShowSettings.interval);
  const setSlideShowInterval = useStore((state) => state.setSlideShowInterval);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [timerReset, setTimerReset] = useState(0); // Used to reset auto-advance timer
  const [isFullscreen, setIsFullscreen] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const { isOpen: showSettings, onToggle: toggleSettings } = useDisclosure();
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

  // Get a consistent Ken Burns variant for each slide
  const kenBurnsVariant = useMemo(() => {
    return kenBurnsVariants[currentIndex % kenBurnsVariants.length];
  }, [currentIndex]);

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
    if (isPaused || showDetails || shuffledMatches.length <= 1) return;

    const timer = setInterval(goNext, interval * 1000);
    return () => clearInterval(timer);
  }, [isPaused, showDetails, interval, shuffledMatches.length, goNext, timerReset]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showDetails) return; // Don't navigate when modal is open
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === ' ') {
        e.preventDefault();
        setIsPaused((p) => !p);
      } else if (e.key === 'Escape') toggleSettings();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev, toggleSettings, showDetails]);

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

  return (
    <Box
      h="100dvh"
      w="100vw"
      position="fixed"
      top={0}
      left={0}
      overflow="hidden"
      bg="black"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => setIsPaused((p) => !p)}
      cursor="pointer"
      sx={{
        touchAction: 'manipulation',
        overscrollBehavior: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* Blurred Background */}
      <AnimatePresence mode="wait">
        <MotionBox
          key={cocktail.id + '-bg'}
          position="absolute"
          inset={-20}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
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
          display="flex"
          alignItems="center"
          justifyContent="center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          pointerEvents="none"
        >
          <MotionImage
            src={cocktail.thumbnail}
            alt={cocktail.name}
            maxH="85vh"
            maxW="60vw"
            objectFit="contain"
            borderRadius="lg"
            boxShadow="2xl"
            initial={{
              scale: kenBurnsVariant.scale[0],
              x: kenBurnsVariant.x[0],
              y: kenBurnsVariant.y[0],
            }}
            animate={{
              scale: kenBurnsVariant.scale[1],
              x: kenBurnsVariant.x[1],
              y: kenBurnsVariant.y[1],
            }}
            transition={{
              duration: interval,
              ease: 'linear',
            }}
          />
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

      {/* Content */}
      <AnimatePresence mode="wait">
        <MotionBox
          key={cocktail.id + '-content'}
          position="absolute"
          bottom={0}
          left={0}
          right={{ base: 0, md: '200px' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          pointerEvents="none"
          sx={{
            paddingLeft: { base: 'calc(1.5rem + env(safe-area-inset-left))', md: 'calc(2rem + env(safe-area-inset-left))' },
            paddingRight: { base: 'calc(1.5rem + env(safe-area-inset-right))', md: 'calc(2rem + env(safe-area-inset-right))' },
            paddingBottom: { base: 'calc(1.5rem + env(safe-area-inset-bottom))', md: 'calc(2rem + env(safe-area-inset-bottom))' },
            paddingTop: { base: '1.5rem', md: '2rem' },
          }}
        >
          <VStack align="start" spacing={4} maxW="800px">
            <Text
              fontSize={{ base: '3xl', md: '5xl', lg: '6xl' }}
              fontWeight="bold"
              color="white"
              textShadow="2px 2px 8px rgba(0,0,0,0.8)"
              lineHeight="1.1"
            >
              {cocktail.name}
            </Text>

            <HStack spacing={2} flexWrap="wrap" align="center">
              <Badge
                colorScheme="purple"
                fontSize={{ base: 'sm', md: 'md' }}
                px={3}
                py={1}
                textShadow="1px 1px 2px rgba(0,0,0,0.5)"
              >
                {cocktail.category}
              </Badge>
              <Badge
                colorScheme="blue"
                fontSize={{ base: 'sm', md: 'md' }}
                px={3}
                py={1}
                textShadow="1px 1px 2px rgba(0,0,0,0.5)"
              >
                {cocktail.glass}
              </Badge>
              {cocktail.tags.map((tag) => (
                <Badge
                  key={tag}
                  colorScheme="teal"
                  fontSize={{ base: 'sm', md: 'md' }}
                  px={3}
                  py={1}
                  textShadow="1px 1px 2px rgba(0,0,0,0.5)"
                >
                  {tag}
                </Badge>
              ))}
            </HStack>

            <VStack align="start" spacing={1}>
              {cocktail.ingredients.map((ing, index) => (
                <Text
                  key={`${ing.name}-${index}`}
                  color="whiteAlpha.900"
                  fontSize={{ base: 'md', md: 'lg' }}
                  textShadow="1px 1px 4px rgba(0,0,0,0.8)"
                >
                  {ing.measure && `${ing.measure} `}
                  {ing.name}
                </Text>
              ))}
            </VStack>
          </VStack>
        </MotionBox>
      </AnimatePresence>

      {/* Navigation Controls */}
      <HStack
        position="absolute"
        spacing={2}
        zIndex={100}
        sx={{
          bottom: { base: 'calc(0.5rem + env(safe-area-inset-bottom))', md: 'calc(1rem + env(safe-area-inset-bottom))' },
          right: { base: 'calc(1.5rem + env(safe-area-inset-right))', md: 'calc(2rem + env(safe-area-inset-right))' },
        }}
      >
        <Link href="/" passHref legacyBehavior>
          <IconButton
            as="a"
            aria-label="Exit Slideshow"
            icon={<CloseIcon boxSize={4} color="white" />}
            bg="blackAlpha.500"
            _hover={{ bg: 'blackAlpha.700' }}
            size="lg"
            isRound
            onClick={(e) => e.stopPropagation()}
          />
        </Link>
        <IconButton
          aria-label="Previous"
          icon={<ChevronLeftIcon boxSize={6} color="white" />}
          onClick={(e) => { e.stopPropagation(); goPrev(); resetTimer(); }}
          bg="blackAlpha.500"
          _hover={{ bg: 'blackAlpha.700' }}
          size="lg"
          isRound
        />
        <IconButton
          aria-label="Next"
          icon={<ChevronRightIcon boxSize={6} color="white" />}
          onClick={(e) => { e.stopPropagation(); goNext(); resetTimer(); }}
          bg="blackAlpha.500"
          _hover={{ bg: 'blackAlpha.700' }}
          size="lg"
          isRound
        />
        <IconButton
          aria-label="View Instructions"
          icon={<InfoIcon boxSize={5} color="white" />}
          onClick={(e) => { e.stopPropagation(); openDetails(); }}
          bg="blackAlpha.500"
          _hover={{ bg: 'blackAlpha.700' }}
          size="lg"
          isRound
        />
        <IconButton
          aria-label="Toggle Fullscreen"
          icon={<Icon as={isFullscreen ? FaCompress : FaExpand} color="white" />}
          onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
          bg="blackAlpha.500"
          _hover={{ bg: 'blackAlpha.700' }}
          size="lg"
          isRound
        />
        <IconButton
          aria-label="Settings"
          icon={<SettingsIcon color="white" />}
          onClick={(e) => { e.stopPropagation(); toggleSettings(); }}
          bg="blackAlpha.500"
          _hover={{ bg: 'blackAlpha.700' }}
          size="lg"
          isRound
        />
      </HStack>

      {/* Settings Panel */}
      {showSettings && (
        <Box
          position="absolute"
          top={0}
          right={0}
          bottom={0}
          w={{ base: '100%', md: '320px' }}
          bg="blackAlpha.900"
          backdropFilter="blur(10px)"
          p={6}
          onClick={(e) => e.stopPropagation()}
        >
          <VStack align="stretch" spacing={6}>
            <Flex justify="space-between" align="center">
              <Text color="white" fontSize="xl" fontWeight="bold">
                Settings
              </Text>
              <IconButton
                aria-label="Close"
                icon={<CloseIcon />}
                onClick={toggleSettings}
                variant="ghost"
                colorScheme="whiteAlpha"
                size="sm"
              />
            </Flex>

            <Box>
              <Text color="white" mb={2}>
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
                <SliderThumb boxSize={6} />
              </Slider>
            </Box>

            <Link href="/" passHref legacyBehavior>
              <Box
                as="a"
                color="teal.300"
                fontSize="lg"
                textAlign="center"
                _hover={{ color: 'teal.200' }}
              >
                Exit Slideshow
              </Box>
            </Link>

            <Text color="whiteAlpha.600" fontSize="sm">
              Keyboard: Arrow keys to navigate, Space to pause
            </Text>
          </VStack>
        </Box>
      )}

      <CocktailModal
        match={currentMatch}
        isOpen={showDetails}
        onClose={closeDetails}
      />
    </Box>
  );
}
