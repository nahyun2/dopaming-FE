import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { quizService, type Quiz } from '@/services/quiz';
import { settingsService } from '@/services/settings';

const PRIMARY_GREEN = '#3D772D';

type ResultState = 'correct' | 'wrong' | null;

function getLocalArithmeticAnswer(question: string): number | null {
  const normalizedQuestion = question
    .replace(/더하기/g, '+')
    .replace(/빼기/g, '-')
    .replace(/곱하기/g, '*')
    .replace(/나누기/g, '/')
    .replace(/[×xX]/g, '*')
    .replace(/[÷]/g, '/');
  const match = normalizedQuestion.match(/(-?\d+(?:\.\d+)?)\s*([+\-*/])\s*(-?\d+(?:\.\d+)?)/);

  if (!match) return null;

  const left = Number(match[1]);
  const operator = match[2];
  const right = Number(match[3]);

  if (!Number.isFinite(left) || !Number.isFinite(right)) return null;

  switch (operator) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '*':
      return left * right;
    case '/':
      return right === 0 ? null : left / right;
    default:
      return null;
  }
}

function isLocallyCorrect(question: string, submittedAnswer: number): boolean {
  const localAnswer = getLocalArithmeticAnswer(question);
  if (localAnswer === null) return false;

  return Math.abs(localAnswer - submittedAnswer) < 0.000001;
}

export default function QuizScreen() {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultState, setResultState] = useState<ResultState>(null);
  const [promptMinutes, setPromptMinutes] = useState(5);

  const loadQuiz = async () => {
    try {
      setIsLoading(true);
      setAnswer('');
      const nextQuiz = await quizService.generate();
      setQuiz(nextQuiz);
    } catch (error) {
      Alert.alert(
        '문제 생성 실패',
        error instanceof Error ? error.message : '문제를 불러오지 못했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await settingsService.getSettings();
      setPromptMinutes(settings.difficultySettings.frequencyMinutes);
    };

    void loadSettings();
    void loadQuiz();
  }, []);

  const handleSubmit = async () => {
    if (!quiz || isSubmitting) return;

    const parsedAnswer = Number(answer.trim());
    if (!answer.trim() || !Number.isFinite(parsedAnswer)) {
      Alert.alert('알림', '정답을 숫자로 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await quizService.submit({
        quizId: quiz.quizId,
        answer: parsedAnswer,
      });

      const isCorrect = result.isCorrect || isLocallyCorrect(quiz.question, parsedAnswer);

      if (isCorrect) {
        const currentSettings = await settingsService.getSettings();
        const fallbackExtendedSeconds = promptMinutes * 60;
        const nextLimitSeconds =
          result.newTotalLimitSeconds ??
          currentSettings.shortformLimitSeconds + (result.extendedSeconds || fallbackExtendedSeconds);

        await settingsService.updateShortformLimit(nextLimitSeconds);
        await settingsService.scheduleNextQuizPrompt();
        setResultState('correct');
      } else {
        setResultState('wrong');
      }
    } catch (error) {
      Alert.alert(
        '제출 실패',
        error instanceof Error ? error.message : '정답을 제출하지 못했습니다.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setResultState(null);
    setAnswer('');
  };

  const closeQuizModal = () => {
    setResultState(null);

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/mascot_stop.png')}
            style={styles.headerMascot}
            resizeMode="contain"
          />
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>제한 Shorts 이용 시간</Text>
            <Text style={styles.headerTitle}>{promptMinutes}분이 지났습니다.</Text>
            <Text style={styles.headerDesc}>계속하시려면 다음 문제를 푸시고</Text>
            <Text style={styles.headerDesc}>
              <Text style={styles.greenText}>제출하기</Text>를 눌러주세요.
            </Text>
          </View>
        </View>

        <View style={styles.quizCard}>
          {isLoading ? (
            <ActivityIndicator size="large" color={PRIMARY_GREEN} />
          ) : (
            <Text style={styles.question}>{quiz?.question ?? '문제를 불러오지 못했습니다.'}</Text>
          )}
        </View>

        <TextInput
          style={styles.answerInput}
          value={answer}
          onChangeText={(value) => setAnswer(value.replace(/[^0-9.-]/g, ''))}
          placeholder="정답 입력"
          placeholderTextColor="#AAAAAA"
          keyboardType="numeric"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          editable={!isLoading && !isSubmitting}
        />

        <Pressable
          disabled={isLoading || isSubmitting || !quiz}
          onPress={handleSubmit}
          style={({ pressed }) => [
            styles.submitButton,
            (isLoading || isSubmitting || !quiz) && styles.disabledButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Text style={styles.submitText}>{isSubmitting ? '제출 중...' : '제출하기'}</Text>
        </Pressable>
      </KeyboardAvoidingView>

      <Modal
        visible={resultState !== null}
        transparent
        animationType="fade"
        onRequestClose={resultState === 'correct' ? closeQuizModal : handleRetry}
      >
        <View style={styles.modalOverlay}>
          {resultState === 'wrong' ? (
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>정답이 아닙니다!</Text>
              <Text style={styles.modalDesc}>
                계속하시려면 정답을 맞춰야 해요!{'\n'}
                이참에 오늘은 여기까지...?
              </Text>
              <Image
                source={require('@/assets/images/mascot_stop.png')}
                style={styles.modalMascot}
                resizeMode="contain"
              />
              <Pressable onPress={handleRetry} style={styles.fullModalButton}>
                <Text style={styles.modalButtonText}>다시 풀어보기</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>정답입니다!</Text>
              <Text style={styles.modalDesc}>
                설정하신 {promptMinutes}분 뒤에 또 다시 찾아올게요!{'\n'}
                여기서 그만 시청해도 좋아요!
              </Text>
              <Image
                source={require('@/assets/images/mascot_great.png')}
                style={styles.modalMascot}
                resizeMode="contain"
              />
              <Pressable onPress={closeQuizModal} style={styles.closeModalButton}>
                <Text style={styles.modalButtonText}>창 끄기</Text>
              </Pressable>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 142,
    paddingTop: 10,
  },
  headerMascot: {
    width: 124,
    height: 124,
    marginRight: 16,
  },
  headerCopy: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#555555',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 23,
    textAlign: 'center',
  },
  headerDesc: {
    color: '#555555',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    textAlign: 'center',
  },
  greenText: {
    color: PRIMARY_GREEN,
    fontWeight: '800',
  },
  quizCard: {
    flex: 1,
    minHeight: 340,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 22,
  },
  question: {
    color: '#000000',
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 38,
    textAlign: 'center',
  },
  answerInput: {
    height: 48,
    marginTop: 16,
    marginHorizontal: 46,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    color: '#111111',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 18,
  },
  submitButton: {
    height: 40,
    marginTop: 14,
    marginHorizontal: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: PRIMARY_GREEN,
  },
  disabledButton: {
    opacity: 0.55,
  },
  pressedButton: {
    opacity: 0.85,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.48)',
    paddingHorizontal: 16,
  },
  modalCard: {
    width: '100%',
    alignItems: 'center',
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 31,
    paddingBottom: 38,
  },
  modalTitle: {
    color: '#000000',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 36,
    marginBottom: 18,
    textAlign: 'center',
  },
  modalDesc: {
    color: '#4D4D4D',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 23,
    marginBottom: 18,
    textAlign: 'center',
  },
  modalMascot: {
    width: 142,
    height: 126,
    marginBottom: 20,
  },
  fullModalButton: {
    width: '100%',
    height: 51,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    backgroundColor: PRIMARY_GREEN,
  },
  closeModalButton: {
    width: 141,
    height: 51,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    backgroundColor: PRIMARY_GREEN,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
});
