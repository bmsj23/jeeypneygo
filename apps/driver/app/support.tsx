import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    id: '1',
    question: 'How do I start a trip?',
    answer:
      'Go to the Dashboard and tap "Start Trip". Make sure location services are enabled. The app will track your route and passenger count automatically.',
  },
  {
    id: '2',
    question: 'How do I update my passenger count?',
    answer:
      'During an active trip, tap the passenger counter on the drive screen. Use + to add passengers and - when passengers alight at stops.',
  },
  {
    id: '3',
    question: 'What is vehicle spacing?',
    answer:
      'Vehicle spacing shows the distance between you and other jeepneys on the same route. This helps maintain even distribution and reduces bunching.',
  },
  {
    id: '4',
    question: 'How are my earnings calculated?',
    answer:
      'Earnings are based on the total passenger fares collected during your trips. The standard fare is ₱13 for the first 4km, plus ₱1.80 per additional km.',
  },
  {
    id: '5',
    question: 'How do I change my assigned route?',
    answer:
      'Contact your fleet operator or visit the operator\'s office to request a route change. Route assignments are managed by your operator.',
  },
  {
    id: '6',
    question: 'What if my license is expiring?',
    answer:
      'Go to Profile > License Details to check your license status. The app will remind you before expiry. Upload your renewed license once renewed.',
  },
];

export default function SupportScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const handleContactEmail = () => {
    Linking.openURL('mailto:support@jeepneygo.ph?subject=Driver App Support');
  };

  const handleContactPhone = () => {
    Linking.openURL('tel:+639123456789');
  };

  const handleOpenMessenger = () => {
    Linking.openURL('https://m.me/jeepneygo');
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Help & Support',
          headerTitleStyle: { fontWeight: '600' },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.colors.background },
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.onSurface} />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* hero card */}
        <View style={[styles.heroCard, { backgroundColor: theme.colors.primaryContainer }]}>
          <View style={[styles.heroIcon, { backgroundColor: theme.colors.primary }]}>
            <MaterialCommunityIcons name="face-agent" size={32} color="#1A237E" />
          </View>
          <Text style={[styles.heroTitle, { color: theme.colors.onSurface }]}>
            How can we help you?
          </Text>
          <Text style={[styles.heroSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Browse FAQs or contact our support team
          </Text>
        </View>

        {/* contact options */}
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Contact Us</Text>
        <View style={styles.contactRow}>
          <Pressable
            style={[styles.contactCard, { backgroundColor: theme.colors.surface }]}
            onPress={handleContactEmail}
          >
            <View style={[styles.contactIcon, { backgroundColor: '#E3F2FD' }]}>
              <MaterialCommunityIcons name="email-outline" size={22} color="#1976D2" />
            </View>
            <Text style={[styles.contactLabel, { color: theme.colors.onSurface }]}>Email</Text>
          </Pressable>

          <Pressable
            style={[styles.contactCard, { backgroundColor: theme.colors.surface }]}
            onPress={handleContactPhone}
          >
            <View style={[styles.contactIcon, { backgroundColor: '#E8F5E9' }]}>
              <MaterialCommunityIcons name="phone-outline" size={22} color="#4CAF50" />
            </View>
            <Text style={[styles.contactLabel, { color: theme.colors.onSurface }]}>Call</Text>
          </Pressable>

          <Pressable
            style={[styles.contactCard, { backgroundColor: theme.colors.surface }]}
            onPress={handleOpenMessenger}
          >
            <View style={[styles.contactIcon, { backgroundColor: '#E1F5FE' }]}>
              <MaterialCommunityIcons name="facebook-messenger" size={22} color="#0288D1" />
            </View>
            <Text style={[styles.contactLabel, { color: theme.colors.onSurface }]}>Chat</Text>
          </Pressable>
        </View>

        {/* faq section */}
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Frequently Asked Questions
        </Text>
        <View style={[styles.faqCard, { backgroundColor: theme.colors.surface }]}>
          {faqs.map((faq, index) => (
            <React.Fragment key={faq.id}>
              <Pressable style={styles.faqItem} onPress={() => toggleFaq(faq.id)}>
                <View style={styles.faqHeader}>
                  <Text style={[styles.faqQuestion, { color: theme.colors.onSurface }]}>
                    {faq.question}
                  </Text>
                  <MaterialCommunityIcons
                    name={expandedFaq === faq.id ? 'chevron-up' : 'chevron-down'}
                    size={22}
                    color={theme.colors.onSurfaceVariant}
                  />
                </View>
                {expandedFaq === faq.id && (
                  <Text style={[styles.faqAnswer, { color: theme.colors.onSurfaceVariant }]}>
                    {faq.answer}
                  </Text>
                )}
              </Pressable>
              {index < faqs.length - 1 && (
                <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* report issue */}
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Report an Issue</Text>
        <View style={[styles.reportCard, { backgroundColor: theme.colors.surface }]}>
          <Pressable style={styles.reportItem}>
            <View style={styles.reportLeft}>
              <View style={[styles.reportIcon, { backgroundColor: '#FFEBEE' }]}>
                <MaterialCommunityIcons name="bug-outline" size={20} color="#EF5350" />
              </View>
              <View>
                <Text style={[styles.reportTitle, { color: theme.colors.onSurface }]}>
                  Report a Bug
                </Text>
                <Text style={[styles.reportDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Something not working?
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={theme.colors.onSurfaceVariant}
            />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />

          <Pressable style={styles.reportItem}>
            <View style={styles.reportLeft}>
              <View style={[styles.reportIcon, { backgroundColor: '#FFF3E0' }]}>
                <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#F57C00" />
              </View>
              <View>
                <Text style={[styles.reportTitle, { color: theme.colors.onSurface }]}>
                  Suggest a Feature
                </Text>
                <Text style={[styles.reportDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Have an idea for improvement?
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={theme.colors.onSurfaceVariant}
            />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />

          <Pressable style={styles.reportItem}>
            <View style={styles.reportLeft}>
              <View style={[styles.reportIcon, { backgroundColor: '#E8F5E9' }]}>
                <MaterialCommunityIcons name="star-outline" size={20} color="#4CAF50" />
              </View>
              <View>
                <Text style={[styles.reportTitle, { color: theme.colors.onSurface }]}>
                  Rate the App
                </Text>
                <Text style={[styles.reportDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Share your experience
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={theme.colors.onSurfaceVariant}
            />
          </Pressable>
        </View>

        {/* bottom padding */}
        <View style={{ height: insets.bottom }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  heroCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  contactCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  contactLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  faqCard: {
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  faqItem: {
    padding: 16,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    paddingRight: 12,
  },
  faqAnswer: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  reportCard: {
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  reportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  reportLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  reportIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  reportDescription: {
    fontSize: 12,
    marginTop: 2,
  },
});
