import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
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

import { AuraOrb } from '@/components/AuraOrb';
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

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { companions, getMessagesForCompanion, addMessage } = useApp();
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

  function getTimeOfDay() {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  }

  const sendMessage = (text?: string) => {
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
    addMessage(id ?? '', { role: 'user', content, createdAt: new Date().toISOString() });

    setIsTyping(true);
    setTimeout(() => {
      const reply = AI_REPLIES[Math.floor(Math.random() * AI_REPLIES.length)];
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        createdAt: new Date().toISOString(),
      };
      setLocalMessages((prev) => [aiMsg, ...prev]);
      addMessage(id ?? '', { role: 'assistant', content: reply, createdAt: new Date().toISOString() });
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageWrapper, isUser && styles.messageWrapperUser]}>
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
            <GlassCard style={styles.aiCard} radius={20}>
              <Text style={styles.aiText}>{item.content}</Text>
            </GlassCard>
            <Text style={styles.timestampLeft}>{companion?.name} · {formatTime(item.createdAt)}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0e1323', '#121A35', '#0B1020']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.ambientTop} pointerEvents="none" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#dee1f9" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerCompanion} activeOpacity={0.8}>
          <View style={styles.headerOrbWrapper}>
            <AuraOrb
              size={38}
              colorFrom={companion?.colorFrom ?? '#c9bfff'}
              colorTo={companion?.colorTo ?? '#8fd8ff'}
              pulsate
              label={companion?.name[0] ?? 'A'}
            />
            <View style={styles.onlineIndicator} />
          </View>
          <View>
            <Text style={styles.headerName}>{companion?.name ?? 'Aurora'}</Text>
            <Text style={styles.headerStatus}>ONLINE</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => router.push('/voice-call')}
          >
            <Ionicons name="call-outline" size={20} color="#c9bfff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="settings-outline" size={20} color="#dee1f9" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
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
              <View style={styles.typingWrapper}>
                <GlassCard style={styles.typingBubble} radius={999}>
                  <View style={styles.typingDots}>
                    <View style={[styles.dot, { opacity: 0.4 }]} />
                    <View style={[styles.dot, { opacity: 0.7 }]} />
                    <View style={[styles.dot, { opacity: 1 }]} />
                  </View>
                  <Text style={styles.typingText}>{companion?.name} is thinking...</Text>
                </GlassCard>
              </View>
            ) : null
          }
          renderItem={renderMessage}
        />

        {/* Input area */}
        <View style={[styles.inputArea, { paddingBottom: bottomPad + 8 }]}>
          {/* Quick chips */}
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
          {/* Input bar */}
          <View style={styles.inputBar}>
            <GlassCard style={styles.inputCard} radius={999}>
              <TouchableOpacity style={styles.inputIconBtn}>
                <Ionicons name="add-circle-outline" size={22} color="#928ea1" />
              </TouchableOpacity>
              <TextInput
                style={styles.textInput}
                value={input}
                onChangeText={setInput}
                placeholder={`Whisper to ${companion?.name ?? 'Aurora'}...`}
                placeholderTextColor="rgba(146,142,161,0.5)"
                multiline
                returnKeyType="send"
                onSubmitEditing={() => sendMessage()}
              />
              <View style={styles.inputRight}>
                <TouchableOpacity style={styles.micBtn} onPress={() => router.push('/voice-call')}>
                  <Ionicons name="mic" size={18} color="#c9bfff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
                  onPress={() => sendMessage()}
                  disabled={!input.trim()}
                >
                  <Ionicons name="send" size={16} color={input.trim() ? '#1a0063' : '#484555'} />
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
  container: { flex: 1, backgroundColor: '#0e1323' },
  flex: { flex: 1 },
  ambientTop: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(201,191,255,0.06)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(14,19,35,0.8)',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCompanion: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 4 },
  headerOrbWrapper: { position: 'relative' },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4ade80',
    borderWidth: 2,
    borderColor: '#0e1323',
  },
  headerName: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 17,
    color: '#c9bfff',
  },
  headerStatus: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 9,
    color: 'rgba(201,191,255,0.7)',
    letterSpacing: 1.5,
  },
  headerActions: { flexDirection: 'row', gap: 4 },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 14,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageWrapper: { maxWidth: '85%', alignSelf: 'flex-start' },
  messageWrapperUser: { alignSelf: 'flex-end' },
  aiBubble: { gap: 6 },
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
    color: 'rgba(146,142,161,0.7)',
    paddingLeft: 4,
  },
  userBubble: { alignItems: 'flex-end', gap: 6 },
  userBubbleGradient: {
    borderRadius: 20,
    borderBottomRightRadius: 4,
    padding: 14,
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
    color: 'rgba(146,142,161,0.7)',
    paddingRight: 4,
  },
  typingWrapper: { alignSelf: 'flex-start' },
  typingBubble: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  typingDots: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#c9bfff',
  },
  typingText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: '#c9bfff',
    letterSpacing: 0.5,
  },
  inputArea: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    gap: 6,
    paddingTop: 6,
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
    paddingRight: 6,
    paddingVertical: 6,
    minHeight: 50,
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
  inputRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  micBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(201,191,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#c9bfff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: 'rgba(72,69,85,0.4)',
  },
});
