'use client';

import {
  Box,
  Button,
  HStack,
  Text,
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  Tooltip,
} from '@chakra-ui/react';
import { CheckIcon, WarningIcon } from '@chakra-ui/icons';
import { useGoogleSync } from '@/contexts/GoogleSyncContext';

// Google icon
const GoogleIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </Icon>
);

// Cloud sync icon
const CloudSyncIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h.71C7.37 7.69 9.48 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3s-1.34 3-3 3z"
    />
  </Icon>
);

export function GoogleSyncStatus() {
  const context = useGoogleSync();

  // If Google sync isn't configured, don't render anything
  if (!context) {
    return null;
  }

  const {
    isSignedIn,
    isLoading,
    isSyncing,
    hasPendingChanges,
    lastSyncedAt,
    error,
    signIn,
    signOut,
    syncNow,
  } = context;

  if (isLoading) {
    return (
      <Box>
        <Spinner size="sm" color="gray.500" />
      </Box>
    );
  }

  if (!isSignedIn) {
    return (
      <Button
        size="sm"
        h="32px"
        px={3}
        leftIcon={<GoogleIcon boxSize={4} />}
        bg="whiteAlpha.100"
        color="gray.300"
        _hover={{ bg: 'whiteAlpha.200' }}
        borderRadius="lg"
        fontWeight="medium"
        onClick={signIn}
      >
        Sync
      </Button>
    );
  }

  const formatLastSync = () => {
    if (!lastSyncedAt) return 'Never';
    const diff = Date.now() - lastSyncedAt.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return lastSyncedAt.toLocaleDateString();
  };

  const getStatusText = () => {
    if (isSyncing) return 'Saving...';
    if (hasPendingChanges) return 'Pending';
    if (error) return 'Error';
    return 'Synced';
  };

  const getStatusColor = () => {
    if (error) return { bg: 'red.900', color: 'red.300', hover: 'red.800' };
    if (isSyncing) return { bg: 'purple.900', color: 'purple.300', hover: 'purple.800' };
    if (hasPendingChanges) return { bg: 'orange.900', color: 'orange.300', hover: 'orange.800' };
    return { bg: 'whiteAlpha.100', color: 'gray.300', hover: 'whiteAlpha.200' };
  };

  const statusColor = getStatusColor();

  return (
    <Menu>
      <Tooltip label={error || `Last synced: ${formatLastSync()}`} placement="bottom">
        <MenuButton
          as={Button}
          size="sm"
          h="32px"
          px={3}
          bg={statusColor.bg}
          color={statusColor.color}
          _hover={{ bg: statusColor.hover }}
          borderRadius="lg"
          fontWeight="medium"
        >
          <HStack spacing={2}>
            {isSyncing ? (
              <Spinner size="xs" />
            ) : error ? (
              <WarningIcon boxSize={3} />
            ) : hasPendingChanges ? (
              <Box w="6px" h="6px" borderRadius="full" bg="orange.400" />
            ) : (
              <CheckIcon boxSize={3} color="green.400" />
            )}
            <Text display={{ base: 'none', sm: 'block' }}>
              {getStatusText()}
            </Text>
          </HStack>
        </MenuButton>
      </Tooltip>
      <MenuList bg="#1a1a1a" borderColor="whiteAlpha.200">
        <MenuItem
          bg="transparent"
          _hover={{ bg: 'whiteAlpha.100' }}
          onClick={syncNow}
          isDisabled={isSyncing}
        >
          <HStack spacing={2}>
            <CloudSyncIcon boxSize={4} />
            <Text>Sync Now</Text>
          </HStack>
        </MenuItem>
        <MenuItem
          bg="transparent"
          _hover={{ bg: 'whiteAlpha.100' }}
          color="red.400"
          onClick={signOut}
        >
          Sign Out
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
