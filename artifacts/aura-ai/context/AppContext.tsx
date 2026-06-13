import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export interface Companion {
  id: string;
  name: string;
  persona: string;
  traits: string[];
  colorFrom: string;
  colorTo: string;
  lastMessage?: string;
  lastActive?: string;
  messageCount?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  birthYear?: number;
  isMinor?: boolean;
  ageVerified?: boolean;
  onboardingDone?: boolean;
  aiDisclosureAccepted?: boolean;
  isPremium?: boolean;
}

interface AppContextType {
  user: UserProfile | null;
  companions: Companion[];
  isAuthenticated: boolean;
  isLoading: boolean;
  messages: Record<string, Message[]>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  addCompanion: (companion: Omit<Companion, 'id'>) => void;
  getMessagesForCompanion: (companionId: string) => Message[];
  addMessage: (companionId: string, message: Omit<Message, 'id'>) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const DEFAULT_COMPANIONS: Companion[] = [
  {
    id: 'aurora',
    name: 'Aurora',
    persona: 'Empathetic, wise, and deeply curious. Aurora specializes in emotional support, creative exploration, and reflective conversations.',
    traits: ['Empathetic', 'Creative', 'Wise', 'Curious'],
    colorFrom: '#c9bfff',
    colorTo: '#8fd8ff',
    lastMessage: 'Ready to explore your thoughts with you...',
    lastActive: 'Active now',
    messageCount: 0,
  },
  {
    id: 'orion',
    name: 'Orion',
    persona: 'Strategic, analytical, and motivating. Orion excels at goal-setting, problem-solving, and keeping you accountable.',
    traits: ['Strategic', 'Analytical', 'Motivating'],
    colorFrom: '#8fd8ff',
    colorTo: '#c9bfff',
    lastMessage: 'Let\'s tackle your goals today.',
    lastActive: '2m ago',
    messageCount: 0,
  },
  {
    id: 'lyra',
    name: 'Lyra',
    persona: 'Playful, imaginative, and storytelling. Lyra loves creative writing, roleplay, and bringing stories to life.',
    traits: ['Playful', 'Imaginative', 'Creative'],
    colorFrom: '#ffb77d',
    colorTo: '#8fd8ff',
    lastMessage: 'What story shall we write today?',
    lastActive: '1h ago',
    messageCount: 0,
  },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [companions, setCompanions] = useState<Companion[]>(DEFAULT_COMPANIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const storedMessages = await AsyncStorage.getItem('messages');
      const storedCompanions = await AsyncStorage.getItem('companions');
      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedMessages) setMessages(JSON.parse(storedMessages));
      if (storedCompanions) setCompanions(JSON.parse(storedCompanions));
    } catch {}
    setIsLoading(false);
  };

  const login = useCallback(async (email: string, _password: string) => {
    const profile: UserProfile = {
      name: email.split('@')[0],
      email,
      ageVerified: true,
      onboardingDone: true,
      aiDisclosureAccepted: true,
      isPremium: false,
    };
    setUser(profile);
    await AsyncStorage.setItem('user', JSON.stringify(profile));
  }, []);

  const register = useCallback(async (name: string, email: string, _password: string) => {
    const profile: UserProfile = {
      name,
      email,
      ageVerified: false,
      onboardingDone: false,
      aiDisclosureAccepted: false,
      isPremium: false,
    };
    setUser(profile);
    await AsyncStorage.setItem('user', JSON.stringify(profile));
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    await AsyncStorage.multiRemove(['user']);
  }, []);

  const updateUser = useCallback(async (updates: Partial<UserProfile>) => {
    setUser(prev => {
      const updated = prev ? { ...prev, ...updates } : (updates as UserProfile);
      AsyncStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addCompanion = useCallback((companion: Omit<Companion, 'id'>) => {
    const newCompanion: Companion = {
      ...companion,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    setCompanions(prev => {
      const updated = [newCompanion, ...prev];
      AsyncStorage.setItem('companions', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getMessagesForCompanion = useCallback((companionId: string): Message[] => {
    return messages[companionId] ?? [];
  }, [messages]);

  const addMessage = useCallback((companionId: string, message: Omit<Message, 'id'>) => {
    const newMsg: Message = {
      ...message,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    setMessages(prev => {
      const updated = {
        ...prev,
        [companionId]: [...(prev[companionId] ?? []), newMsg],
      };
      AsyncStorage.setItem('messages', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AppContext.Provider value={{
      user,
      companions,
      isAuthenticated: !!user,
      isLoading,
      messages,
      login,
      register,
      logout,
      updateUser,
      addCompanion,
      getMessagesForCompanion,
      addMessage,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
