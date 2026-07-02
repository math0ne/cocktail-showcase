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
  Badge,
  Image,
  Button,
  Divider,
} from '@chakra-ui/react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
} from '@chakra-ui/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useCocktails } from '@/hooks/useCocktails';
import { useStore } from '@/store/useStore';
import type { CocktailMatch } from '@/types';

const MotionBox = motion(Box);

// Simple slide transition
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface SlideshowProps {
  onClose?: () => void;
}

export function Slideshow({ onClose }: SlideshowProps) {
  const { fullMatches, loading } = useCocktails();
  const slideShowSettings = useStore((state) => state.slideShowSettings);
  const setSlideShowInterval = useStore((state) => state.setSlideShowInterval);
  const triedCocktails = useStore((state) => state.triedCocktails);
  const heartedCocktails = useStore((state) => state.heartedCocktails);
  const toggleTried = useStore((state) => state.toggleTried);
  const toggleHearted = useStore((state) => state.toggleHearted);

  const { interval } = slideShowSettings;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timerReset, setTimerReset] = useState(0);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const resetTimer = useCallback(() => {
    setTimerReset((t) => t + 1);
  }, []);

  // Exit handler
  const handleExit = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.log('Exit fullscreen error:', err);
    }
    if (onClose) {
      onClose();
    } else {
      window.location.href = '/';
    }
  }, [onClose]);

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

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((i) => (i + 1) % shuffledMatches.length);
  }, [shuffledMatches.length]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((i) => (i - 1 + shuffledMatches.length) % shuffledMatches.length);
  }, [shuffledMatches.length]);

  // Auto-advance
  useEffect(() => {
    if (isPaused || shuffledMatches.length <= 1) return;

    const timer = setInterval(goNext, interval * 1000);
    return () => clearInterval(timer);
  }, [isPaused, interval, shuffledMatches.length, goNext, timerReset]);

  // Progress bar animation
  useEffect(() => {
    if (isPaused || shuffledMatches.length <= 1) {
      setProgress(0);
      return;
    }

    setProgress(0);
    let animationId: number;
    const startTime = performance.now();
    const duration = interval * 1000;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress < 100) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused, interval, shuffledMatches.length, currentIndex, timerReset]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { goNext(); resetTimer(); }
      else if (e.key === 'ArrowLeft') { goPrev(); resetTimer(); }
      else if (e.key === 'Escape') handleExit();
      else if (e.key === ' ') { e.preventDefault(); setIsPaused(p => !p); }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev, handleExit, resetTimer]);

  // Touch swipe handlers
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;

    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        goNext();
      } else {
        goPrev();
      }
      resetTimer();
    }
    setTouchStart(null);
  };

  if (loading) {
    return (
      <Flex h="100vh" align="center" justify="center" bg="#0d0d0d">
        <Text color="gray.400" fontSize="xl">Loading cocktails...</Text>
      </Flex>
    );
  }

  if (shuffledMatches.length === 0) {
    return (
      <Flex h="100vh" align="center" justify="center" bg="#0d0d0d" direction="column" gap={4}>
        <Text color="gray.400" fontSize="xl">No cocktails available.</Text>
        <Button
          onClick={handleExit}
          bg="purple.600"
          color="white"
          _hover={{ bg: 'purple.500' }}
          borderRadius="xl"
        >
          Go Back
        </Button>
      </Flex>
    );
  }

  const cocktail = currentMatch.cocktail;
  const isTried = triedCocktails.includes(cocktail.id);
  const isLiked = heartedCocktails.includes(cocktail.id);

  return (
    <Flex
      h="100vh"
      w="100vw"
      bg="#0d0d0d"
      overflow="hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Left Panel - Info & Controls */}
      <Flex
        direction="column"
        w={{ base: '100%', lg: '400px' }}
        minW={{ lg: '400px' }}
        h="100%"
        bg="#0d0d0d"
        borderRight="1px solid"
        borderColor="whiteAlpha.100"
        display={{ base: 'none', lg: 'flex' }}
      >
        {/* Header */}
        <Flex
          align="center"
          justify="space-between"
          p={4}
          borderBottom="1px solid"
          borderColor="whiteAlpha.100"
        >
          <HStack spacing={3}>
            <IconButton
              aria-label="Close"
              icon={<CloseIcon />}
              onClick={handleExit}
              variant="ghost"
              color="gray.400"
              _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
              borderRadius="lg"
            />
            <Text color="gray.400" fontSize="sm" fontWeight="medium">
              {currentIndex + 1} / {shuffledMatches.length}
            </Text>
          </HStack>
          <HStack spacing={2}>
            <IconButton
              aria-label="Previous"
              icon={<ChevronLeftIcon boxSize={5} />}
              onClick={() => { goPrev(); resetTimer(); }}
              variant="ghost"
              color="gray.400"
              _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
              borderRadius="lg"
            />
            <IconButton
              aria-label="Next"
              icon={<ChevronRightIcon boxSize={5} />}
              onClick={() => { goNext(); resetTimer(); }}
              variant="ghost"
              color="gray.400"
              _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
              borderRadius="lg"
            />
          </HStack>
        </Flex>

        {/* Progress Bar */}
        <Box h="2px" bg="whiteAlpha.100">
          <Box
            h="100%"
            bg="purple.500"
            w={`${progress}%`}
            transition="width 0.1s linear"
          />
        </Box>

        {/* Content */}
        <VStack
          flex={1}
          align="stretch"
          p={6}
          spacing={6}
          overflowY="auto"
        >
          {/* Title */}
          <Box>
            <Text
              fontSize="3xl"
              fontWeight="bold"
              color="white"
              lineHeight="1.2"
              mb={3}
            >
              {cocktail.name}
            </Text>

            {/* Badges */}
            <HStack spacing={2} flexWrap="wrap">
              {isTried && (
                <Badge bg="green.500" color="white" borderRadius="full" px={3} py={1}>
                  Tried
                </Badge>
              )}
              {isLiked && (
                <Badge bg="red.500" color="white" borderRadius="full" px={3} py={1}>
                  Liked
                </Badge>
              )}
              <Badge bg="purple.500" color="white" borderRadius="full" px={3} py={1}>
                {cocktail.category}
              </Badge>
              <Badge bg="gray.600" color="white" borderRadius="full" px={3} py={1}>
                {cocktail.glass}
              </Badge>
            </HStack>
          </Box>

          <Divider borderColor="whiteAlpha.100" />

          {/* Ingredients */}
          <Box>
            <Text color="gray.400" fontSize="sm" fontWeight="semibold" mb={3} textTransform="uppercase" letterSpacing="wide">
              Ingredients
            </Text>
            <VStack align="stretch" spacing={2}>
              {cocktail.ingredients.map((ing, idx) => (
                <HStack key={idx} justify="space-between">
                  <Text color="white" fontSize="md">{ing.name}</Text>
                  {ing.measure && (
                    <Text color="gray.400" fontSize="sm">{ing.measure}</Text>
                  )}
                </HStack>
              ))}
            </VStack>
          </Box>

          <Divider borderColor="whiteAlpha.100" />

          {/* Instructions */}
          <Box>
            <Text color="gray.400" fontSize="sm" fontWeight="semibold" mb={3} textTransform="uppercase" letterSpacing="wide">
              Instructions
            </Text>
            <Text color="gray.300" fontSize="sm" lineHeight="1.7">
              {cocktail.instructions}
            </Text>
          </Box>

          {/* Spacer */}
          <Box flex={1} />

          {/* Actions */}
          <HStack spacing={3}>
            <Button
              flex={1}
              size="md"
              bg={isTried ? 'green.500' : 'whiteAlpha.100'}
              color="white"
              _hover={{ bg: isTried ? 'green.400' : 'whiteAlpha.200' }}
              borderRadius="xl"
              onClick={() => toggleTried(cocktail.id)}
            >
              {isTried ? 'Tried' : 'Mark Tried'}
            </Button>
            <Button
              flex={1}
              size="md"
              bg={isLiked ? 'red.500' : 'whiteAlpha.100'}
              color="white"
              _hover={{ bg: isLiked ? 'red.400' : 'whiteAlpha.200' }}
              borderRadius="xl"
              onClick={() => toggleHearted(cocktail.id)}
            >
              {isLiked ? 'Liked' : 'Like'}
            </Button>
          </HStack>

          {/* Timer Control */}
          <Box
            bg="#121214"
            p={4}
            borderRadius="xl"
            border="1px solid"
            borderColor="whiteAlpha.100"
          >
            <HStack justify="space-between" mb={3}>
              <Text color="gray.400" fontSize="sm">Auto-advance: {interval}s</Text>
              <Button
                size="xs"
                variant="ghost"
                color={isPaused ? 'orange.400' : 'gray.400'}
                _hover={{ bg: 'whiteAlpha.100' }}
                onClick={() => setIsPaused(p => !p)}
              >
                {isPaused ? 'Paused' : 'Pause'}
              </Button>
            </HStack>
            <Slider
              value={interval}
              min={5}
              max={30}
              step={1}
              onChange={(val) => { setSlideShowInterval(val); resetTimer(); }}
            >
              <SliderTrack bg="whiteAlpha.200" h="6px" borderRadius="full">
                <SliderFilledTrack bg="purple.500" />
              </SliderTrack>
              <SliderThumb boxSize={4} />
            </Slider>
          </Box>
        </VStack>
      </Flex>

      {/* Right Panel - Image */}
      <Box
        flex={1}
        h="100%"
        position="relative"
        overflow="hidden"
        bg="black"
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <MotionBox
            key={cocktail.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'tween', duration: 0.4, ease: [0.4, 0, 0.2, 1] },
              opacity: { duration: 0.3 },
            }}
            position="absolute"
            inset={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Image
              src={cocktail.thumbnail}
              alt={cocktail.name}
              h="100%"
              w="100%"
              objectFit="cover"
            />
          </MotionBox>
        </AnimatePresence>

        {/* Mobile Controls Overlay */}
        <Box
          display={{ base: 'block', lg: 'none' }}
          position="absolute"
          inset={0}
          bgGradient="linear(to-t, blackAlpha.800 0%, transparent 30%, transparent 70%, blackAlpha.600 100%)"
        >
          {/* Top Bar */}
          <Flex
            position="absolute"
            top={0}
            left={0}
            right={0}
            p={4}
            align="center"
            justify="space-between"
          >
            <IconButton
              aria-label="Close"
              icon={<CloseIcon />}
              onClick={handleExit}
              bg="blackAlpha.500"
              color="white"
              _hover={{ bg: 'blackAlpha.700' }}
              borderRadius="full"
              size="sm"
            />
            <Text color="white" fontSize="sm" fontWeight="medium">
              {currentIndex + 1} / {shuffledMatches.length}
            </Text>
            <Box w="32px" /> {/* Spacer for centering */}
          </Flex>

          {/* Progress Bar */}
          <Box
            position="absolute"
            top="56px"
            left={4}
            right={4}
            h="2px"
            bg="whiteAlpha.300"
            borderRadius="full"
          >
            <Box
              h="100%"
              bg="purple.500"
              w={`${progress}%`}
              borderRadius="full"
            />
          </Box>

          {/* Bottom Info */}
          <VStack
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            p={6}
            align="stretch"
            spacing={3}
          >
            <Text fontSize="2xl" fontWeight="bold" color="white">
              {cocktail.name}
            </Text>
            <HStack spacing={2}>
              <Badge bg="purple.500" color="white" borderRadius="full" px={3} py={1}>
                {cocktail.category}
              </Badge>
              <Badge bg="gray.600" color="white" borderRadius="full" px={3} py={1}>
                {cocktail.glass}
              </Badge>
            </HStack>
            <HStack spacing={3} pt={2}>
              <IconButton
                aria-label="Previous"
                icon={<ChevronLeftIcon boxSize={6} />}
                onClick={() => { goPrev(); resetTimer(); }}
                bg="whiteAlpha.200"
                color="white"
                _hover={{ bg: 'whiteAlpha.300' }}
                borderRadius="full"
                size="lg"
              />
              <IconButton
                aria-label="Next"
                icon={<ChevronRightIcon boxSize={6} />}
                onClick={() => { goNext(); resetTimer(); }}
                bg="whiteAlpha.200"
                color="white"
                _hover={{ bg: 'whiteAlpha.300' }}
                borderRadius="full"
                size="lg"
              />
              <Button
                flex={1}
                size="lg"
                bg={isTried ? 'green.500' : 'whiteAlpha.200'}
                color="white"
                _hover={{ bg: isTried ? 'green.400' : 'whiteAlpha.300' }}
                borderRadius="full"
                onClick={() => toggleTried(cocktail.id)}
              >
                {isTried ? 'Tried' : 'Tried?'}
              </Button>
              <Button
                flex={1}
                size="lg"
                bg={isLiked ? 'red.500' : 'whiteAlpha.200'}
                color="white"
                _hover={{ bg: isLiked ? 'red.400' : 'whiteAlpha.300' }}
                borderRadius="full"
                onClick={() => toggleHearted(cocktail.id)}
              >
                {isLiked ? 'Liked' : 'Like?'}
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Box>
    </Flex>
  );
}
