// src/pages/Settings.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Heading,
  Avatar,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  SimpleGrid,
  Image,
  Icon,
  Text,
  Button,
  Input,
  VStack,
  Flex,
  useColorModeValue,
  SkeletonCircle,
  IconButton,
  Switch,
  FormControl,
  FormLabel,
  Stack,
  Divider,
  HStack,
  Spacer,
} from "@chakra-ui/react";
import { IoAdd, IoNotificationsOutline, IoCloudUploadOutline } from "react-icons/io5";
import CompactThemeSwitch from "../components/CompactThemeSwitch";
import { Global } from "@emotion/react";

const STORAGE_KEY = "catcare_profile_avatar";
const STORAGE_NOTIF_KEY = "catcare_notifications";
const STORAGE_GUEST_KEY = "catcare_guest_settings";

const PRESET_AVATARS = [
  "/avatars/avatar1.png",
  "/avatars/avatar2.png",
  "/avatars/avatar3.png",
  "/avatars/avatar4.png",
  "/avatars/avatar5.png",
];

const DEFAULT_NOTIFICATION_SETTINGS = {
  feeding: true,
  grooming: true,
  vet: true,
  updates: true,
  promotions: false,
};

const DEFAULT_GUEST_SETTINGS = {
  guestMode: false,
  guestPermissions: {
    viewPets: true,
    viewTasks: true,
    markTasksDone: true,
    editTasks: false,
    editPets: false,
  },
  guestCode: null,
};

// Small reusable SectionCard to create consistent cards/sections
const SectionCard = ({ children, ...props }) => {
  const bg = useColorModeValue("#ffffff", "gray.800");
  const border = useColorModeValue("rgba(15,23,42,0.04)", "rgba(255,255,255,0.04)");
  const shadow = useColorModeValue("0 10px 30px rgba(2,6,23,0.06)", "0 8px 30px rgba(0,0,0,0.6)");
  return (
    <Box
      bg={bg}
      border={`1px solid ${border}`}
      borderRadius="12px"
      boxShadow={shadow}
      p={{ base: 3, md: 4 }}
      transition="background 180ms ease, transform 160ms ease, box-shadow 180ms ease"
      {...props}
    >
      {children}
    </Box>
  );
};

function shortCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function safeParseJSON(str) {
  try { return JSON.parse(str); } catch (e) { return null; }
}

function mergeArraysById(a = [], b = []) {
  const map = new Map();
  a.forEach((item) => { if (item && item.id) map.set(item.id, item); });
  b.forEach((item) => { if (item && item.id) map.set(item.id, item); });
  return Array.from(map.values());
}

function EmptyState({ title, body }) {
  return (
    <Box textAlign="center" py={6} px={4} userSelect="none">
      <Text fontWeight={700}>{title}</Text>
      <Text fontSize="sm" color="gray.500">{body}</Text>
    </Box>
  );
}

// Advanced styled switch used across settings for a refined look
function AdvancedSwitch({ isChecked, onChange, ariaLabel }) {
  const uncheckedTrack = useColorModeValue("#e6eef9", "#1b2430");
  const checkedTrack = useColorModeValue("#2dd4bf", "#2dd4bf");

  return (
    <Switch
      isChecked={isChecked}
      onChange={onChange}
      aria-label={ariaLabel}
      size="md"
      sx={{
        // track
        "& .chakra-switch__track": {
          width: "44px",
          height: "24px",
          borderRadius: "999px",
          bg: isChecked ? checkedTrack : uncheckedTrack,
          transition: "background .16s ease",
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.02)",
        },
        // thumb
        "& .chakra-switch__thumb": {
          width: "18px",
          height: "18px",
          boxShadow: "0 6px 18px rgba(2,6,23,0.12)",
          transform: isChecked ? "translateX(20px)" : "translateX(2px)",
          transition: "transform .18s cubic-bezier(.2,.9,.2,1), background .12s ease",
        },
      }}
    />
  );
}

export default function Settings() {
  const [avatarSrc, setAvatarSrc] = useState(null);
  const [isGalleryImage, setIsGalleryImage] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure(); // avatar drawer
  const {
    isOpen: notifOpen,
    onOpen: onNotifOpen,
    onClose: onNotifClose,
  } = useDisclosure(); // notifications drawer
  const {
    isOpen: guestModalOpen,
    onOpen: onGuestModalOpen,
    onClose: onGuestModalClose,
  } = useDisclosure(); // guest settings modal
  const {
    isOpen: confirmCloseOpen,
    onOpen: onConfirmCloseOpen,
    onClose: onConfirmCloseClose,
  } = useDisclosure(); // confirm disable modal
  const {
    isOpen: exportOpen,
    onOpen: onExportOpen,
    onClose: onExportClose,
  } = useDisclosure(); // export modal
  const {
    isOpen: importOpen,
    onOpen: onImportOpen,
    onClose: onImportClose,
  } = useDisclosure(); // import modal

  const fileRef = useRef(null);
  const importFileRef = useRef(null);

  const labelBg = useColorModeValue("gray.50", "gray.700");
  const labelBorder = useColorModeValue("gray.200", "gray.600");
  const sectionTextColor = useColorModeValue("gray.700", "gray.200");
  const headerBorder = useColorModeValue("teal.200", "teal.700");

  const username = "Josephoctavio";

  const getCurrentUserId = () => {
    const p = localStorage.getItem('user_profile');
    if (p) {
      try { const obj = JSON.parse(p); return obj?.id || obj?.userId || null; } catch (e) { return null; }
    }
    const id = localStorage.getItem('user_profile_id') || localStorage.getItem('user_id') || null;
    return id;
  };

  const [notifSettings, setNotifSettings] = useState(DEFAULT_NOTIFICATION_SETTINGS);
  const [guestSettings, setGuestSettings] = useState(DEFAULT_GUEST_SETTINGS);

  const [exporting, setExporting] = useState(false);
  const [exportUrl, setExportUrl] = useState(null);
  const [exportFilename, setExportFilename] = useState("");
  const [downloading, setDownloading] = useState(false);

  const [importFilename, setImportFilename] = useState("");
  const [importRaw, setImportRaw] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [importError, setImportError] = useState("");
  const [importProcessing, setImportProcessing] = useState(false);
  const [importStrictMode, setImportStrictMode] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setAvatarSrc(saved);
      setIsGalleryImage(!PRESET_AVATARS.includes(saved));
    } else {
      setAvatarSrc(PRESET_AVATARS[0]);
    }

    const savedNotif = localStorage.getItem(STORAGE_NOTIF_KEY);
    if (savedNotif) {
      try {
        setNotifSettings(JSON.parse(savedNotif));
      } catch (e) {
        setNotifSettings(DEFAULT_NOTIFICATION_SETTINGS);
      }
    }

    const savedGuest = localStorage.getItem(STORAGE_GUEST_KEY);
    if (savedGuest) {
      try {
        setGuestSettings(JSON.parse(savedGuest));
      } catch (e) {
        setGuestSettings(DEFAULT_GUEST_SETTINGS);
      }
    }
  }, []);

  useEffect(() => {
    if (avatarSrc) localStorage.setItem(STORAGE_KEY, avatarSrc);
  }, [avatarSrc]);

  useEffect(() => {
    localStorage.setItem(STORAGE_NOTIF_KEY, JSON.stringify(notifSettings));
  }, [notifSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_GUEST_KEY, JSON.stringify(guestSettings));
  }, [guestSettings]);

  function handlePresetSelect(src) {
    setAvatarSrc(src);
    setIsGalleryImage(false);
    onClose();
  }

  function fileToDataUrl(file) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = rej;
      fr.readAsDataURL(file);
    });
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setAvatarSrc(dataUrl);
      setIsGalleryImage(true);
      onClose();
    } catch (err) {
      console.error("Failed to read file", err);
    }
  }

  function handleImgError(e) {
    e.currentTarget.style.opacity = 0.55;
    e.currentTarget.style.filter = "grayscale(60%)";
  }

  function handleRemoveCustom() {
    const ok = window.confirm("Remove custom profile picture and revert to a preset?");
    if (!ok) return;
    localStorage.removeItem(STORAGE_KEY);
    const randomPreset = PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)];
    setAvatarSrc(randomPreset);
    setIsGalleryImage(false);
  }

  function toggleNotif(key) {
    setNotifSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function turnOffAllNotifications() {
    setNotifSettings({
      feeding: false,
      grooming: false,
      vet: false,
      updates: false,
      promotions: false,
    });
  }

  const enabledCount = Object.values(notifSettings).filter(Boolean).length;

  function handleGuestToggleChange() {
    if (!guestSettings.guestMode) {
      setGuestSettings((prev) => ({ ...prev, guestMode: true, guestCode: prev.guestCode || shortCode() }));
      setTimeout(() => onGuestModalOpen(), 120);
      return;
    }
    onConfirmCloseOpen();
  }

  function confirmDisableGuestMode() {
    setGuestSettings((prev) => ({ ...prev, guestMode: false }));
    onConfirmCloseClose();
  }

  function toggleGuestPermission(key) {
    setGuestSettings((prev) => ({
      ...prev,
      guestPermissions: { ...prev.guestPermissions, [key]: !prev.guestPermissions[key] },
    }));
  }

  function regenerateGuestCode() {
    const code = shortCode();
    setGuestSettings((prev) => ({ ...prev, guestCode: code }));
  }

  async function copyGuestCode() {
    try {
      if (!guestSettings.guestCode) return;
      await navigator.clipboard.writeText(guestSettings.guestCode);
      alert(`Guest code copied: ${guestSettings.guestCode}`);
    } catch (e) {
      console.error("copy failed", e);
    }
  }

  async function prepareExport() {
    setExporting(true);
    const exportObj = {};
    const keysToTry = [STORAGE_NOTIF_KEY, STORAGE_GUEST_KEY, 'pets', 'tasks', 'pet_profiles', 'user_profile', 'app_state'];
    for (const k of keysToTry) {
      const value = localStorage.getItem(k);
      if (!value) continue;
      try {
        exportObj[k] = JSON.parse(value);
      } catch (e) {
        exportObj[k] = value;
      }
    }

    const avatar = localStorage.getItem(STORAGE_KEY);
    if (avatar) {
      if (typeof avatar === 'string' && avatar.startsWith('data:')) {
        exportObj.profileAvatar = null;
      } else {
        exportObj.profileAvatar = avatar;
      }
    }

    exportObj.exportedAt = new Date().toISOString();

    const filename = `catcare_backup_${new Date().toISOString().slice(0, 10)}.json`;
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    setExportUrl(url);
    setExportFilename(filename);
    setExporting(false);
  }

  async function downloadExport() {
    if (!exportUrl) return;
    const safeName = (exportFilename || 'catcare_backup.json').trim();
    const finalName = safeName.toLowerCase().endsWith('.json') ? safeName : `${safeName}.json`;

    setDownloading(true);
    const a = document.createElement('a');
    a.href = exportUrl;
    a.download = finalName;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => {
      setDownloading(false);
    }, 800);
  }

  function cleanupExportUrl() {
    if (exportUrl) {
      try { URL.revokeObjectURL(exportUrl); } catch (e) {}
      setExportUrl(null);
      setExportFilename('');
    }
  }

  async function handleExportClick() {
    onExportOpen();
    await prepareExport();
  }

  function resetImportState() {
    setImportFilename('');
    setImportRaw(null);
    setImportPreview(null);
    setImportError('');
    setImportProcessing(false);
  }

  async function handleImportFile(e) {
    resetImportState();
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFilename(file.name || 'import.json');

    if (!file.name.toLowerCase().endsWith('.json')) {
      setImportError('Only .json files are accepted');
      return;
    }

    try {
      const text = await file.text();
      const obj = safeParseJSON(text);
      if (!obj || typeof obj !== 'object') {
        setImportError('File is not valid JSON');
        return;
      }

      const knownKeys = ['pets', 'tasks', 'settings', STORAGE_NOTIF_KEY, STORAGE_GUEST_KEY, 'user_profile'];
      const hasKnown = knownKeys.some((k) => Object.prototype.hasOwnProperty.call(obj, k));
      if (!hasKnown) {
        setImportError('JSON does not contain expected app data');
        return;
      }

      if (importStrictMode) {
        const ownerIdFromFile = obj.owner_id || obj.ownerId || (obj.user_profile && (obj.user_profile.id || obj.user_profile.userId));
        const currentId = getCurrentUserId();
        if (ownerIdFromFile && currentId && ownerIdFromFile !== currentId) {
          setImportError('File owner does not match current user. Import blocked in strict mode.');
          return;
        }
      }

      const preview = {
        ownerId: obj.owner_id || obj.ownerId || (obj.user_profile && (obj.user_profile.id || obj.user_profile.userId)) || null,
        pets: Array.isArray(obj.pets) ? obj.pets.length : (obj.pets ? Object.keys(obj.pets).length : 0),
        tasks: Array.isArray(obj.tasks) ? obj.tasks.length : (obj.tasks ? Object.keys(obj.tasks).length : 0),
        settings: obj.settings ? 1 : 0,
        notifications: obj[STORAGE_NOTIF_KEY] ? 1 : 0,
      };

      setImportRaw(obj);
      setImportPreview(preview);
      setImportError('');
    } catch (err) {
      console.error('Import read failed', err);
      setImportError('Failed to read file');
    }
  }

  async function applyImport(mode = 'merge') {
    if (!importRaw) return;
    setImportProcessing(true);
    try {
      const keys = ['pets','tasks','settings', STORAGE_NOTIF_KEY, STORAGE_GUEST_KEY, 'user_profile','app_state','pet_profiles'];
      for (const k of keys) {
        if (!(k in importRaw)) continue;
        const incoming = importRaw[k];
        const currentRaw = localStorage.getItem(k);
        if (mode === 'replace') {
          localStorage.setItem(k, JSON.stringify(incoming));
          continue;
        }

        if (Array.isArray(incoming)) {
          let existing = [];
          try { existing = currentRaw ? JSON.parse(currentRaw) : []; } catch (e) { existing = []; }
          const merged = mergeArraysById(existing, incoming);
          localStorage.setItem(k, JSON.stringify(merged));
        } else if (typeof incoming === 'object' && incoming !== null) {
          let existing = {};
          try { existing = currentRaw ? JSON.parse(currentRaw) : {}; } catch (e) { existing = {}; }
          const merged = { ...existing, ...incoming };
          localStorage.setItem(k, JSON.stringify(merged));
        } else {
          localStorage.setItem(k, JSON.stringify(incoming));
        }
      }

      const savedNotif = localStorage.getItem(STORAGE_NOTIF_KEY);
      if (savedNotif) {
        try { setNotifSettings(JSON.parse(savedNotif)); } catch (e) { /* ignore */ }
      }
      const savedGuest = localStorage.getItem(STORAGE_GUEST_KEY);
      if (savedGuest) {
        try { setGuestSettings(JSON.parse(savedGuest)); } catch (e) { /* ignore */ }
      }

      alert(`Import ${mode} completed.`);
      resetImportState();
      onImportClose();
    } catch (err) {
      console.error('Import apply failed', err);
      setImportError('Failed to apply import');
    } finally {
      setImportProcessing(false);
    }
  }

  // Try to send a browser notification. Works only if the site is served over https or localhost
  async function sendTestNotification() {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      try { new Notification('CatCare — Test', { body: 'This is a test notification.' }); } catch (e) { console.error(e); }
      return;
    }

    if (Notification.permission !== 'denied') {
      try {
        const p = await Notification.requestPermission();
        if (p === 'granted') new Notification('CatCare — Test', { body: 'This is a test notification.' });
        else alert('Permission denied for notifications');
      } catch (e) {
        console.error('Permission request failed', e);
      }
    } else {
      alert('Notifications are blocked for this site. Please enable them in your browser settings.');
    }
  }

  return (
    <Box
      minH="100vh"
      px={{ base: 3, md: 4 }}
      pb={{ base: 12, md: 16 }}
      sx={{
        // Keep any focused element outlines removed (we still preserve keyboard focus by not removing focus ring from
        // inputs and contenteditable elements). All buttons, role=button, icon-buttons get no outline for visual polish.
        '[role="button"], button, .chakra-button, .chakra-icon-button': {
          outline: "none",
          boxShadow: "none",
        },
      }}
    >
      {/* Global CSS: remove text selection except on inputs and contenteditable; remove tap highlight and button focus blue */}
      <Global
        styles={`
          html, body { -webkit-tap-highlight-color: transparent; }
          a, button { -webkit-tap-highlight-color: transparent; }
          button:focus, .chakra-button:focus, [role="button"]:focus { box-shadow: none !important; outline: none !important; }
          button:active, .chakra-button:active, [role="button"]:active { transform: none !important; }
          /* Disable selection on all non-editable elements to match your request */
          *:not(input):not(textarea):not([contenteditable="true"]) { -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; }
          img { -webkit-user-drag: none; user-drag: none; }
        `}
      />

      {/* Header */}
      <Box pt={4} pb={3} mb={4}>
        <Heading
          as="h1"
          fontSize={{ base: "lg", md: "xl" }}
          fontWeight="800"
          fontFamily="Poppins, Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
          color={sectionTextColor}
          lineHeight="short"
          letterSpacing="-0.2px"
        >
          Settings
        </Heading>
      </Box>

      {/* Avatar + Username (centered) */}
      <Box display="flex" justifyContent="center" mt={2} flexDirection="column" alignItems="center">
        <Box position="relative" textAlign="center">
          <SkeletonCircle isLoaded={!!avatarSrc} size={{ base: "120px", md: "160px" }}>
            <Avatar
              boxSize={{ base: "96px", md: "144px" }}
              name="Profile"
              src={avatarSrc || undefined}
              cursor="pointer"
              onClick={onOpen}
              border="2px solid"
              borderColor={useColorModeValue("teal.500", "teal.300")}
              boxShadow="sm"
              sx={{ img: { objectFit: "cover" } }}
              aria-label="Open avatar picker"
            />
          </SkeletonCircle>

          <IconButton
            aria-label="Edit avatar"
            icon={<IoAdd />}
            position="absolute"
            bottom={-3}
            right={-3}
            size="sm"
            borderRadius="full"
            boxShadow="sm"
            _focus={{ boxShadow: "none" }}
            onClick={() => fileRef.current?.click()}
            bg={useColorModeValue("white", "gray.800")}
          />
        </Box>

        <Text
          mt={3}
          fontSize="sm"
          fontWeight="600"
          textAlign="center"
          fontFamily="Inter, system-ui, -apple-system, 'Segoe UI', Roboto"
          color={sectionTextColor}
          letterSpacing="0.2px"
        >
          {username}
        </Text>
      </Box>

      {/* PERSONALIZATION SUBHEADER */}
      <Box mt={8} mb={4}>
        <Text
          fontSize="sm"
          fontWeight="700"
          color={sectionTextColor}
          textTransform="uppercase"
          letterSpacing="0.6px"
          mb={2}
        >
          Personalization
        </Text>
        <Box height="2px" width="44px" bg={useColorModeValue("teal.200", "teal.600")} mb={4} borderRadius="xl" />
      </Box>

      {/* THEME ROW - wrapped in SectionCard */}
      <SectionCard mb={4}>
        <Flex align="center" justify="space-between">
          <Box>
            <Text fontSize="sm" fontWeight="600" color={sectionTextColor}>
              Theme
            </Text>
            <Text fontSize="xs" color={useColorModeValue("gray.500", "gray.400")}>Toggle between light and dark</Text>
          </Box>

          <CompactThemeSwitch />
        </Flex>
      </SectionCard>

      {/* small divider between groups */}
      <Box my={4} />

      {/* NOTIFICATIONS GROUP HEADER */}
      <Box mb={2}>
        <Text fontSize="sm" fontWeight="700" color={sectionTextColor} textTransform="uppercase">Notifications</Text>
        <Text fontSize="xs" color={useColorModeValue('gray.500','gray.400')}>Manage reminders and app notices</Text>
      </Box>

      {/* NOTIFICATIONS ROW */}
      <SectionCard mb={4}>
        <Flex align="center" justify="space-between">
          <Box textAlign="left">
            <Text fontSize="sm" fontWeight="600" color={sectionTextColor}>
              Notifications
            </Text>
            <Text fontSize="xs" color={useColorModeValue("gray.500","gray.400")}>Configure which reminders and app notices you receive</Text>
          </Box>

          <VStack spacing={1} align="end">
            <IconButton aria-label="Open notifications" icon={<IoNotificationsOutline />} onClick={onNotifOpen} />
            <Text fontSize="xs" color={useColorModeValue("gray.500","gray.400")}>{enabledCount} enabled</Text>
          </VStack>
        </Flex>
      </SectionCard>

      {/* small divider between groups */}
      <Box my={4} />

      {/* DATA GROUP HEADER */}
      <Box mb={2}>
        <Text fontSize="sm" fontWeight="700" color={sectionTextColor} textTransform="uppercase">Data</Text>
        <Text fontSize="xs" color={useColorModeValue('gray.500','gray.400')}>Export and import your app data</Text>
      </Box>

      {/* EXPORT DATA ROW */}
      <SectionCard mb={4}>
        <Flex align="center" justify="space-between">
          <Box>
            <Text fontSize="sm" fontWeight="600" color={sectionTextColor}>
              Export Data
            </Text>
            <Text fontSize="xs" color={useColorModeValue("gray.500","gray.400")}>Download a JSON backup of your data (no images)</Text>
          </Box>

          <Button onClick={handleExportClick} isLoading={exporting} size="sm">Export</Button>
        </Flex>
      </SectionCard>

      {/* IMPORT DATA ROW (below Export) */}
      <SectionCard mb={4}>
        <Flex align="center" justify="space-between">
          <Box>
            <Text fontSize="sm" fontWeight="600" color={sectionTextColor}>
              Import Data
            </Text>
            <Text fontSize="xs" color={useColorModeValue("gray.500","gray.400")}>Restore from a previous JSON export. Images are not restored.</Text>
          </Box>

          <Button leftIcon={<IoCloudUploadOutline />} size="sm" onClick={() => { resetImportState(); onImportOpen(); }}>
            Import
          </Button>
        </Flex>
      </SectionCard>

      {/* GUEST ACCESS ROW */}
      <SectionCard mb={4}>
        <Flex align="center" w="100%">
          <Box flex="1">
            <Text fontSize="sm" fontWeight="600" color={sectionTextColor}>
              Guest Access
            </Text>
            <Text fontSize="xs" color={useColorModeValue("gray.500","gray.400")}>Allow a friend or sitter to access this household</Text>
          </Box>

          <HStack spacing={3} align="center">
            <Text fontSize="xs" color={useColorModeValue("gray.500","gray.400")}>{guestSettings.guestMode ? "Enabled" : "Disabled"}</Text>
            <VStack spacing={0} align="end">
              <AdvancedSwitch isChecked={!!guestSettings.guestMode} onChange={handleGuestToggleChange} ariaLabel="Toggle guest mode" />
              {guestSettings.guestMode && (
                <Text fontSize="xs" color="blue.500" cursor="pointer" onClick={onGuestModalOpen} _hover={{ textDecoration: 'underline' }}>
                  Manage
                </Text>
              )}
            </VStack>
          </HStack>
        </Flex>
      </SectionCard>

      {/* Hidden file input for avatar */}
      <Input ref={fileRef} type="file" accept="image/*" display="none" onChange={handleFileChange} />
      {/* Hidden file input for import */}
      <Input ref={importFileRef} type="file" accept="application/json" display="none" onChange={handleImportFile} />

      {/* Avatar Drawer (bottom) */}
      <Drawer placement="bottom" onClose={onClose} isOpen={isOpen} size="full">
        <DrawerOverlay />
        <DrawerContent borderTopRadius="16px" maxH={{ base: "38vh", md: "32vh" }}>
          <DrawerCloseButton />
          <DrawerHeader>
            <Text fontWeight="700">Choose an avatar</Text>
            <Text fontSize="sm" color="gray.500">Tap one to select or use + to pick from gallery</Text>
          </DrawerHeader>

          <DrawerBody>
            <VStack spacing={4} align="stretch">
              <SimpleGrid minChildWidth="72px" spacing={3}>
                {PRESET_AVATARS.map((src, idx) => (
                  <Box
                    key={src}
                    as="button"
                    onClick={() => handlePresetSelect(src)}
                    borderRadius="full"
                    overflow="hidden"
                    cursor="pointer"
                    _focus={{ boxShadow: "outline" }}
                    _hover={{ transform: "scale(1.05)" }}
                    transition="transform .15s ease"
                    aria-label={`Select avatar ${idx + 1}`}
                  >
                    <Image
                      src={src}
                      alt={`avatar-${idx + 1}`}
                      objectFit="cover"
                      w="72px"
                      h="72px"
                      borderRadius="full"
                      onError={handleImgError}
                      loading="lazy"
                      draggable={false}
                    />
                  </Box>
                ))}

                {/* Gallery pick button */}
                <Box textAlign="center">
                  <Button
                    onClick={() => fileRef.current && fileRef.current.click()}
                    variant="outline"
                    borderRadius="full"
                    w="72px"
                    h="72px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    p={0}
                    _focus={{ boxShadow: "none" }}
                    _active={{ bg: "transparent" }}
                    size="sm"
                    aria-label="Pick image from gallery"
                  >
                    <Icon as={IoAdd} boxSize={6} />
                  </Button>
                </Box>
              </SimpleGrid>

              {isGalleryImage && (
                <Button
                  variant="outline"
                  colorScheme="red"
                  size="sm"
                  w="fit-content"
                  alignSelf="center"
                  onClick={handleRemoveCustom}
                  _focus={{ boxShadow: "none" }}
                  _active={{ bg: "transparent" }}
                >
                  Remove Profile Picture
                </Button>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Notifications Drawer (bottom) - granular toggles */}
      <Drawer placement="bottom" onClose={onNotifClose} isOpen={notifOpen} size="sm">
        <DrawerOverlay />
        <DrawerContent borderTopRadius="16px" maxH={{ base: "44vh", md: "40vh" }}>
          <DrawerCloseButton />
          <DrawerHeader>
            <Text fontWeight="700">Notifications</Text>
            <Text fontSize="sm" color="gray.500">Control reminders and app notices</Text>
          </DrawerHeader>

          <DrawerBody>
            <Stack spacing={3}>
              <Button size="sm" colorScheme="red" variant="ghost" onClick={turnOffAllNotifications}>Turn off all notifications</Button>
              <Button size="sm" variant="outline" onClick={sendTestNotification}>Send test notification</Button>

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <FormLabel mb={0} fontWeight="600">Feeding reminders</FormLabel>
                  <Text fontSize="xs" color={useColorModeValue("gray.500","gray.400")}>Reminders for scheduled feedings</Text>
                </Box>
                <AdvancedSwitch isChecked={!!notifSettings.feeding} onChange={() => toggleNotif('feeding')} ariaLabel="Toggle feeding reminders" />
              </FormControl>

              <Divider />

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <FormLabel mb={0} fontWeight="600">Bath & grooming</FormLabel>
                  <Text fontSize="xs" color={useColorModeValue("gray.500","gray.400")}>Shampoos, trims, and baths</Text>
                </Box>
                <AdvancedSwitch isChecked={!!notifSettings.grooming} onChange={() => toggleNotif('grooming')} ariaLabel="Toggle grooming reminders" />
              </FormControl>

              <Divider />

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <FormLabel mb={0} fontWeight="600">Vet visit reminders</FormLabel>
                  <Text fontSize="xs" color={useColorModeValue("gray.500","gray.400")}>Appointments and checkups</Text>
                </Box>
                <AdvancedSwitch isChecked={!!notifSettings.vet} onChange={() => toggleNotif('vet')} ariaLabel="Toggle vet reminders" />
              </FormControl>

              <Divider />

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <FormLabel mb={0} fontWeight="600">App updates</FormLabel>
                  <Text fontSize="xs" color={useColorModeValue("gray.500","gray.400")}>Release notes and important changes</Text>
                </Box>
                <AdvancedSwitch isChecked={!!notifSettings.updates} onChange={() => toggleNotif('updates')} ariaLabel="Toggle update notifications" />
              </FormControl>

              <Divider />

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <FormLabel mb={0} fontWeight="600">Promotions</FormLabel>
                  <Text fontSize="xs" color={useColorModeValue("gray.500","gray.400")}>Offers and marketing (optional)</Text>
                </Box>
                <AdvancedSwitch isChecked={!!notifSettings.promotions} onChange={() => toggleNotif('promotions')} ariaLabel="Toggle promotions" />
              </FormControl>

            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Export Modal (preparing + download) */}
      <Modal isOpen={exportOpen} onClose={() => { onExportClose(); cleanupExportUrl(); }} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="12px">
          <ModalHeader fontWeight={700}>Export Data</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {exporting ? (
              <Text>Preparing your data…</Text>
            ) : (
              <Stack spacing={3}>
                <Text fontSize="sm" color={useColorModeValue("gray.600","gray.400")}>Your backup is ready. You can rename the file and click download to save the JSON file to your device.</Text>

                <Box>
                  <FormLabel mb={1} fontSize="xs" fontWeight="600">File name</FormLabel>
                  <Input
                    value={exportFilename}
                    onChange={(e) => setExportFilename(e.target.value)}
                    placeholder={`catcare_backup_${new Date().toISOString().slice(0,10)}.json`}
                    size="sm"
                    aria-label="Export filename"
                  />
                </Box>

                <HStack>
                  <Box borderRadius="8px" p={3} border={`1px solid ${useColorModeValue('gray.200','whiteAlpha.060')}`}>
                    <Text fontSize="sm" fontWeight="700">Preview: {exportFilename || `catcare_backup_${new Date().toISOString().slice(0,10)}.json`}</Text>
                  </Box>
                  <Spacer />
                  <Button size="sm" onClick={downloadExport} disabled={!exportUrl} isLoading={downloading} aria-label="Download export">Download</Button>
                  <Button size="sm" variant="ghost" onClick={() => { cleanupExportUrl(); onExportClose(); }}>Close</Button>
                </HStack>
              </Stack>
            )}
          </ModalBody>

          <ModalFooter>
            {exporting ? <Button isLoading>Preparing</Button> : null}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Import Modal (file picker + preview + merge/replace) */}
      <Modal isOpen={importOpen} onClose={() => { onImportClose(); resetImportState(); }} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="12px">
          <ModalHeader fontWeight={700}>Import Data</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={3}>
              <Text fontSize="sm" color={useColorModeValue("gray.600","gray.400")}>Select a JSON export to import. We will validate the file before allowing merge or replace.</Text>

              <Box>
                <FormLabel mb={1} fontSize="xs" fontWeight="600">File</FormLabel>
                <HStack>
                  <Button leftIcon={<IoCloudUploadOutline />} onClick={() => importFileRef.current && importFileRef.current.click()} size="sm" aria-label="Choose import file">Choose file</Button>
                  <Box borderRadius="8px" px={3} py={2} border={`1px solid ${useColorModeValue('gray.200','whiteAlpha.060')}`} minW="180px">
                    <Text fontSize="sm" color={importFilename ? useColorModeValue('gray.800','gray.100') : useColorModeValue('gray.500','gray.400')}>{importFilename || 'No file selected'}</Text>
                  </Box>
                  <Spacer />
                  <Button size="sm" variant="ghost" onClick={resetImportState} disabled={!importFilename}>Clear</Button>
                </HStack>
                <Text fontSize="xs" color={useColorModeValue('gray.500','gray.400')} mt={2}>Only .json files exported from this app are accepted. Files are validated before import.</Text>
              </Box>

              <Box>
                <FormLabel mb={1} fontSize="xs" fontWeight="600">Strict mode</FormLabel>
                <Text fontSize="xs" color={useColorModeValue('gray.500','gray.400')}>When enabled, imports whose owner id does not match the currently logged-in user will be blocked.</Text>
                <HStack mt={2}>
                  <Text fontSize="xs">Owner-only</Text>
                  <AdvancedSwitch isChecked={importStrictMode} onChange={() => setImportStrictMode((s) => !s)} ariaLabel="Toggle strict import mode" />
                </HStack>
              </Box>

              <Divider />

              {importError ? (
                <Text color="red.400" role="alert">{importError}</Text>
              ) : null}

              <Box aria-live="polite">
                {importPreview ? (
                  <Box>
                    <Text fontSize="sm" fontWeight="600">Preview</Text>
                    <Text fontSize="xs">Owner: {importPreview.ownerId || 'Unknown'}</Text>
                    <Text fontSize="xs">Pets: {importPreview.pets}</Text>
                    <Text fontSize="xs">Tasks: {importPreview.tasks}</Text>
                    <Text fontSize="xs">Settings present: {importPreview.settings ? 'Yes' : 'No'}</Text>
                  </Box>
                ) : (
                  <EmptyState title="No file selected" body="Pick a .json export to see a preview and import options." />
                )}
              </Box>

            </Stack>
          </ModalBody>

          <ModalFooter>
            <HStack>
              <Button variant="ghost" onClick={() => { resetImportState(); onImportClose(); }}>Cancel</Button>
              <Button colorScheme="blue" onClick={() => applyImport('merge')} isLoading={importProcessing} disabled={!importPreview || !!importError}>Merge</Button>
              <Button colorScheme="red" onClick={() => applyImport('replace')} isLoading={importProcessing} disabled={!importPreview || !!importError}>Replace</Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Guest Settings Modal (popup) */}
      <Modal isOpen={guestModalOpen} onClose={onGuestModalClose} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="12px">
          <ModalHeader fontWeight={700}>Guest Mode Active</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={3}>
              <Text fontSize="sm" color={useColorModeValue("gray.600","gray.400") }>
                Guest mode is active. Share the code below with your guest so they can access the household with the permissions you set here.
              </Text>

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <FormLabel mb={0} fontWeight="600">View pet profiles</FormLabel>
                  <Text fontSize="xs" color={useColorModeValue("gray.500","gray.400")}>Allow guest to see pet details</Text>
                </Box>
                <AdvancedSwitch isChecked={!!guestSettings.guestPermissions.viewPets} onChange={() => toggleGuestPermission('viewPets')} ariaLabel="Toggle view pets" />
              </FormControl>

              <Divider />

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <FormLabel mb={0} fontWeight="600">View schedules & tasks</FormLabel>
                  <Text fontSize="xs" color={useColorModeValue("gray.500","gray.400")}>See upcoming tasks and schedules</Text>
                </Box>
                <AdvancedSwitch isChecked={!!guestSettings.guestPermissions.viewTasks} onChange={() => toggleGuestPermission('viewTasks')} ariaLabel="Toggle view tasks" />
              </FormControl>

              <Divider />

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <FormLabel mb={0} fontWeight="600">Mark tasks as done</FormLabel>
                  <Text fontSize="xs" color={useColorModeValue("gray.500","gray.400")}>Allow guest to check off completed tasks</Text>
                </Box>
                <AdvancedSwitch isChecked={!!guestSettings.guestPermissions.markTasksDone} onChange={() => toggleGuestPermission('markTasksDone')} ariaLabel="Toggle mark tasks" />
              </FormControl>

              <Divider />

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <FormLabel mb={0} fontWeight="600">Add / Edit tasks</FormLabel>
                  <Text fontSize="xs" color={useColorModeValue("gray.500","gray.400")}>Allow guest to create or modify tasks</Text>
                </Box>
                <AdvancedSwitch isChecked={!!guestSettings.guestPermissions.editTasks} onChange={() => toggleGuestPermission('editTasks')} ariaLabel="Toggle edit tasks" />
              </FormControl>

              <Divider />

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <FormLabel mb={0} fontWeight="600">Add / Edit pets</FormLabel>
                  <Text fontSize="xs" color={useColorModeValue("gray.500","gray.400")}>Allow guest to create or modify pet profiles</Text>
                </Box>
                <AdvancedSwitch isChecked={!!guestSettings.guestPermissions.editPets} onChange={() => toggleGuestPermission('editPets')} ariaLabel="Toggle edit pets" />
              </FormControl>

              <Divider />

              <Box mt={2}>
                <Text fontSize="sm" fontWeight="600">Guest Code</Text>
                <Text fontSize="xs" color={useColorModeValue("gray.500","gray.400")}>Share this code with your sitter. Regenerate to invalidate old codes.</Text>
                <HStack>
                  <Box borderRadius="8px" p={3} border={`1px solid ${useColorModeValue('gray.200','whiteAlpha.060')}`}>
                    <Text fontSize="lg" fontWeight="700">{guestSettings.guestCode || '—'}</Text>
                  </Box>
                  <Spacer />
                  <Button size="sm" onClick={copyGuestCode} disabled={!guestSettings.guestCode}>Copy</Button>
                  <Button size="sm" variant="outline" onClick={regenerateGuestCode}>Regenerate</Button>
                </HStack>
              </Box>

              <Box>
                <Button variant="link" onClick={() => (window.location.href = '/guest-help')}>Learn more</Button>
              </Box>

              <Box>
                <Text fontSize="xs" color={useColorModeValue("gray.500","gray.400") }>
                  Note: this is a local UI mock for now. Later we will sync codes to Firestore and issue short-lived tokens for better security.
                </Text>
              </Box>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button onClick={onGuestModalClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Confirm Disable Guest Mode Modal */}
      <Modal isOpen={confirmCloseOpen} onClose={onConfirmCloseClose} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="12px">
          <ModalHeader fontWeight={700}>Disable Guest Mode?</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Turning off Guest Mode will immediately revoke access for anyone using the current guest code. They will no longer be able to view or manage this household.
            </Text>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onConfirmCloseClose}>Cancel</Button>
            <Button colorScheme="red" onClick={confirmDisableGuestMode}>Turn off</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  );
}
