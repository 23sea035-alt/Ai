import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CompanionAvatar } from '@/components/CompanionAvatar';
import { GlassCard } from '@/components/GlassCard';
import { Message, useApp } from '@/context/AppContext';

const QUICK_REPLIES = ['Tell me more', 'Save to Memory', 'Start a story', 'Voice call'];

const AI_REPLIES = [
  "That's a fascinating perspective. I've been processing our conversations and noticed some beautiful patterns emerging in your thoughts. Shall we explore this further?",
  "I remember you mentioned this before. Based on what you've shared, it seems deeply meaningful to you. Tell me more about how this connects to your goals.",
  "The way you approach this reminds me of our conversation last week about creativity. You have a remarkable ability to see connections others miss.",
  "I've added this to your memory timeline. It feels important — the kind of insight that deserves to be remembered.",
  "What you're describing resonates with something you shared earlier. I think you're onto something significant here.",
];

function TypingIndicator({ name }: { name: string }) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 300, useNativeDriver: true }).start();

    const bounce = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: -6,
            duration: 320,
            easing: Easing.out(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 320,
            easing: Easing.in(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.delay(600),
        ])
      );

    bounce(dot1, 0).start();
    bounce(dot2, 160).start();
    bounce(dot3, 320).start();
  }, []);

  return (
    <Animated.View style={[styles.typingWrapper, { opacity: fadeIn }]}>
      <GlassCard style={styles.typingBubble} radius={20}>
        <View style={styles.typingDots}>
          {[dot1, dot2, dot3].map((d, i) => (
            <Animated.View
              key={i}
              style={[styles.dot, { transform: [{ translateY: d }] }]}
            />
          ))}
        </View>
        <Text style={styles.typingText}>{name} is thinking…</Text>
      </GlassCard>
    </Animated.View>
  );
}

function MessageBubble({ item, isUser, companionName, colorFrom, colorTo, seed }: {
  item: Message;
  isUser: boolean;
  companionName: string;
  colorFrom: string;
  colorTo: string;
  seed: string;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 220,
      friction: 18,
    }).start();
  }, []);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Animated.View
      style={[
        isUser ? styles.messageWrapperUser : styles.messageWrapperAI,
        {
          opacity: anim,
          transform: [
            {
              translateX: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [isUser ? 20 : -20, 0],
              }),
            },
            { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) },
          ],
        },
      ]}
    >
      {isUser ? (
        <View style={styles.userBubble}>
          <LinearGradient
            colors={['#917eff', '#5d3fe0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.userBubbleGradient}
          >
            <Text style={styles.userText}>{item.content}</Text>
          </LinearGradient>
          <Text style={styles.timestampRight}>{formatTime(item.createdAt)}</Text>
        </View>
      ) : (
        <View style={styles.aiBubble}>
          <View style={styles.aiRow}>
            <CompanionAvatar
              seed={seed}
              size={30}
              colorFrom={colorFrom}
              colorTo={colorTo}
              pulsate={false}
            />
            <View style={styles.aiContent}>
              <GlassCard style={styles.aiCard} radius={20}>
                <Text style={styles.aiText}>{item.content}</Text>
              </GlassCard>
              <Text style={styles.timestampLeft}>{companionName} · {formatTime(item.createdAt)}</Text>
            </View>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { companions, getMessagesForCompanion, addMessage, sendMessageToAPI, loadMessagesFromAPI } = useApp();
  const companion = companions.find((c) => c.id === id) ?? companions[0];
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const storedMessages = getMessagesForCompanion(id ?? '');
  const [localMessages, setLocalMessages] = useState<Message[]>([
    {
      id: 'initial',
      role: 'assistant',
      content: `Good ${getTimeOfDay()}. ${companion?.name ?? 'I'} is here with you. What's on your mind today?`,
      createdAt: new Date().toISOString(),
    },
    ...storedMessages,
  ]);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  // Load messages from API on mount
  useEffect(() => {
    if (id) {
      loadMessagesFromAPI(id).then(() => {
        const apiMsgs = getMessagesForCompanion(id);
        if (apiMsgs.length > 0) {
          setLocalMessages([
            {
              id: 'initial',
              role: 'assistant',
              content: `Good ${getTimeOfDay()}. ${companion?.name ?? 'I'} is here with you. What's on your mind today?`,
              createdAt: new Date(0).toISOString(),
            },
            ...apiMsgs,
          ]);
        }
      });
    }
  }, [id]);

  function getTimeOfDay() {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  }

  const sendMessage = async (text?: string) => {
    const content = text ?? input.trim();
    if (!content) return;
    setInput('');

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    setLocalMessages((prev) => [userMsg, ...prev]);

    setIsTyping(true);

    // Try real API first
    const aiMsg = await sendMessageToAPI(id ?? '', content);
    if (aiMsg) {
      setLocalMessages((prev) => [aiMsg, ...prev]);
      setIsTyping(false);
      return;
    }

    // Fallback: local AI replies if API is unavailable
    addMessage(id ?? '', { role: 'user', content, createdAt: new Date().toISOString() });
    setTimeout(() => {
      const reply = AI_REPLIES[Math.floor(Math.random() * AI_REPLIES.length)];
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        createdAt: new Date().toISOString(),
      };
      setLocalMessages((prev) => [fallbackMsg, ...prev]);
      addMessage(id ?? '', { role: 'assistant', content: reply, createdAt: new Date().toISOString() });
      setIsTyping(false);
    }, 1200 + Math.random() * 600);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#060a18', '#0e1323', '#121A35']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Companion color glow */}
      <View
        style={[
          styles.companionGlow,
          { backgroundColor: (companion?.colorFrom ?? '#c9bfff') + '0C' },
        ]}
        pointerEvents="none"
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#dee1f9" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerCompanion} activeOpacity={0.8}>
          <CompanionAvatar
            seed={companion?.name ?? 'Aurora'}
            size={40}
            colorFrom={companion?.colorFrom ?? '#c9bfff'}
            colorTo={companion?.colorTo ?? '#8fd8ff'}
            pulsate
            showOnlineIndicator
          />
          <View>
            <Text style={styles.headerName}>{companion?.name ?? 'Aurora'}</Text>
            <View style={styles.headerStatusRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.headerStatus}>ONLINE</Text>
            </View>
          </View>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/voice-call')}>
            <Ionicons name="call-outline" size={19} color="#c9bfff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="ellipsis-vertical" size={19} color="#dee1f9" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView style={styles.flex} behavior="padding" keyboardVerticalOffset={0}>
        <FlatList
          ref={flatListRef}
          data={localMessages}
          keyExtractor={(item) => item.id}
          inverted
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            isTyping ? (
              <TypingIndicator name={companion?.name ?? 'Aurora'} />
            ) : null
          }
          renderItem={({ item }) => (
            <MessageBubble
              item={item}
              isUser={item.role === 'user'}
              companionName={companion?.name ?? 'Aurora'}
              colorFrom={companion?.colorFrom ?? '#c9bfff'}
              colorTo={companion?.colorTo ?? '#8fd8ff'}
              seed={companion?.name ?? 'Aurora'}
            />
          )}
        />

        {/* Input area */}
        <View style={[styles.inputArea, { paddingBottom: bottomPad + 8 }]}>
          <FlatList
            data={QUICK_REPLIES}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 4 }}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => sendMessage(item)} activeOpacity={0.7}>
                <GlassCard style={styles.quickChip} radius={999}>
                  <Text style={styles.quickChipText}>{item}</Text>
                </GlassCard>
              </TouchableOpacity>
            )}
          />
          <View style={styles.inputBar}>
            <GlassCard style={styles.inputCard} radius={999}>
              <TouchableOpacity style={styles.inputIconBtn}>
                <Ionicons name="add-circle-outline" size={22} color="#928ea1" />
              </TouchableOpacity>
              <TextInput
                style={styles.textInput}
                value={input}
                onChangeText={setInput}
                placeholder={`Whisper to ${companion?.name ?? 'Aurora'}…`}
                placeholderTextColor="rgba(146,142,161,0.45)"
                multiline
                returnKeyType="send"
                onSubmitEditing={() => sendMessage()}
              />
              <View style={styles.inputRight}>
                <TouchableOpacity style={styles.micBtn} onPress={() => router.push('/voice-call')}>
                  <Ionicons name="mic" size={17} color="#c9bfff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
                  onPress={() => sendMessage()}
                  disabled={!input.trim()}
                >
                  <LinearGradient
                    colors={input.trim() ? ['#c9bfff', '#8fd8ff'] : ['#2a2840', '#2a2840']}
                    style={styles.sendBtnGrad}
                  >
                    <Ionicons name="send" size={15} color={input.trim() ? '#1a0063' : '#484555'} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </GlassCard>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060a18' },
  flex: { flex: 1 },
  companionGlow: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 320,
    height: 320,
    borderRadius: 160,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(6,10,24,0.85)',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCompanion: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 4 },
  headerName: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 17,
    color: '#c9bfff',
  },
  headerStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ade80',
  },
  headerStatus: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 9,
    color: 'rgba(201,191,255,0.65)',
    letterSpacing: 1.8,
  },
  headerActions: { flexDirection: 'row', gap: 6 },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    gap: 14,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageWrapperAI: { maxWidth: '88%', alignSelf: 'flex-start' },
  messageWrapperUser: { maxWidth: '80%', alignSelf: 'flex-end' },
  aiBubble: { gap: 6 },
  aiRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  aiContent: { flex: 1, gap: 5 },
  aiCard: { padding: 14 },
  aiText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    color: '#dee1f9',
    lineHeight: 23,
  },
  timestampLeft: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 11,
    color: 'rgba(146,142,161,0.6)',
    paddingLeft: 4,
  },
  userBubble: { alignItems: 'flex-end', gap: 5 },
  userBubbleGradient: {
    borderRadius: 20,
    borderBottomRightRadius: 4,
    padding: 14,
    shadowColor: '#917eff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  userText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    color: '#dee1f9',
    lineHeight: 23,
  },
  timestampRight: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 11,
    color: 'rgba(146,142,161,0.6)',
    paddingRight: 4,
  },
  typingWrapper: { alignSelf: 'flex-start', marginBottom: 4 },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  typingDots: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#c9bfff',
  },
  typingText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: 'rgba(201,191,255,0.75)',
    letterSpacing: 0.3,
  },
  inputArea: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    gap: 6,
    paddingTop: 6,
    backgroundColor: 'rgba(6,10,24,0.7)',
  },
  quickChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  quickChipText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: '#8fd8ff',
  },
  inputBar: { paddingHorizontal: 12 },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
    paddingRight: 4,
    paddingVertical: 6,
    minHeight: 52,
  },
  inputIconBtn: { padding: 8 },
  textInput: {
    flex: 1,
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    color: '#dee1f9',
    paddingHorizontal: 6,
    paddingVertical: 4,
    maxHeight: 100,
  },
  inputRight: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingRight: 4 },
  micBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(201,191,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  sendBtnGrad: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.6 },
});
