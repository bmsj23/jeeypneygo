import React from 'react';
import { View, StyleSheet, Pressable, Linking } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function SupportHero() {
  const theme = useTheme();

  return (
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
  );
}

interface ContactOptionsProps {
  onEmailPress?: () => void;
  onPhonePress?: () => void;
  onChatPress?: () => void;
}

export function ContactOptions({ onEmailPress, onPhonePress, onChatPress }: ContactOptionsProps) {
  const theme = useTheme();

  const handleEmail = () => {
    if (onEmailPress) {
      onEmailPress();
    } else {
      Linking.openURL('mailto:support@jeepneygo.ph?subject=Commuter App Support');
    }
  };

  const handlePhone = () => {
    if (onPhonePress) {
      onPhonePress();
    } else {
      Linking.openURL('tel:+639123456789');
    }
  };

  const handleChat = () => {
    if (onChatPress) {
      onChatPress();
    } else {
      Linking.openURL('https://m.me/jeepneygo');
    }
  };

  return (
    <>
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Contact Us</Text>
      <View style={styles.contactRow}>
        <Pressable
          style={[styles.contactCard, { backgroundColor: theme.colors.surface }]}
          onPress={handleEmail}
        >
          <View style={[styles.contactIcon, { backgroundColor: '#E3F2FD' }]}>
            <MaterialCommunityIcons name="email-outline" size={22} color="#1976D2" />
          </View>
          <Text style={[styles.contactLabel, { color: theme.colors.onSurface }]}>Email</Text>
        </Pressable>

        <Pressable
          style={[styles.contactCard, { backgroundColor: theme.colors.surface }]}
          onPress={handlePhone}
        >
          <View style={[styles.contactIcon, { backgroundColor: '#E8F5E9' }]}>
            <MaterialCommunityIcons name="phone-outline" size={22} color="#4CAF50" />
          </View>
          <Text style={[styles.contactLabel, { color: theme.colors.onSurface }]}>Call</Text>
        </Pressable>

        <Pressable
          style={[styles.contactCard, { backgroundColor: theme.colors.surface }]}
          onPress={handleChat}
        >
          <View style={[styles.contactIcon, { backgroundColor: '#E1F5FE' }]}>
            <MaterialCommunityIcons name="facebook-messenger" size={22} color="#0288D1" />
          </View>
          <Text style={[styles.contactLabel, { color: theme.colors.onSurface }]}>Chat</Text>
        </Pressable>
      </View>
    </>
  );
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
  expandedId: string | null;
  onToggle: (id: string) => void;
}

export function FAQSection({ faqs, expandedId, onToggle }: FAQSectionProps) {
  const theme = useTheme();

  return (
    <>
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        Frequently Asked Questions
      </Text>
      <View style={[styles.faqCard, { backgroundColor: theme.colors.surface }]}>
        {faqs.map((faq, index) => (
          <React.Fragment key={faq.id}>
            <Pressable style={styles.faqItem} onPress={() => onToggle(faq.id)}>
              <View style={styles.faqHeader}>
                <Text style={[styles.faqQuestion, { color: theme.colors.onSurface }]}>
                  {faq.question}
                </Text>
                <MaterialCommunityIcons
                  name={expandedId === faq.id ? 'chevron-up' : 'chevron-down'}
                  size={22}
                  color={theme.colors.onSurfaceVariant}
                />
              </View>
              {expandedId === faq.id && (
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
    </>
  );
}

interface ReportItem {
  id: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  onPress?: () => void;
}

interface ReportSectionProps {
  items?: ReportItem[];
}

export function ReportSection({ items }: ReportSectionProps) {
  const theme = useTheme();

  const defaultItems: ReportItem[] = [
    {
      id: 'bug',
      icon: 'bug-outline',
      iconColor: '#EF5350',
      iconBg: '#FFEBEE',
      title: 'Report a Bug',
      description: 'Something not working?',
    },
    {
      id: 'feature',
      icon: 'lightbulb-outline',
      iconColor: '#F57C00',
      iconBg: '#FFF3E0',
      title: 'Suggest a Feature',
      description: 'Have an idea for improvement?',
    },
    {
      id: 'rate',
      icon: 'star-outline',
      iconColor: '#4CAF50',
      iconBg: '#E8F5E9',
      title: 'Rate the App',
      description: 'Share your experience',
    },
  ];

  const reportItems = items || defaultItems;

  return (
    <>
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Feedback</Text>
      <View style={[styles.reportCard, { backgroundColor: theme.colors.surface }]}>
        {reportItems.map((item, index) => (
          <React.Fragment key={item.id}>
            <Pressable style={styles.reportItem} onPress={item.onPress}>
              <View style={styles.reportLeft}>
                <View style={[styles.reportIcon, { backgroundColor: item.iconBg }]}>
                  <MaterialCommunityIcons name={item.icon} size={20} color={item.iconColor} />
                </View>
                <View>
                  <Text style={[styles.reportTitle, { color: theme.colors.onSurface }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.reportDescription, { color: theme.colors.onSurfaceVariant }]}>
                    {item.description}
                  </Text>
                </View>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color={theme.colors.onSurfaceVariant}
              />
            </Pressable>
            {index < reportItems.length - 1 && (
              <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />
            )}
          </React.Fragment>
        ))}
      </View>
    </>
  );
}

export function getDefaultFAQs(): FAQItem[] {
  return [
    {
      id: '1',
      question: 'How do I track a jeepney?',
      answer:
        'Open the app and view the map. You can see all active jeepneys in real-time. Tap on any jeepney marker to see details like passenger count, route, and estimated arrival time.',
    },
    {
      id: '2',
      question: 'How do I save a stop as favorite?',
      answer:
        'Navigate to any stop details page and tap the heart icon to save it. You can also access your favorites from the Saved tab in the navigation bar.',
    },
    {
      id: '3',
      question: 'How accurate is the ETA?',
      answer:
        'ETAs are calculated based on real-time GPS data from drivers and typical traffic conditions. Actual arrival times may vary depending on traffic, stops, and passenger boarding.',
    },
    {
      id: '4',
      question: 'Why can\'t I see any jeepneys?',
      answer:
        'Make sure you have an internet connection. If there are no markers, it may mean no drivers are currently active on that route. Try checking different routes or times.',
    },
    {
      id: '5',
      question: 'How do I change the language?',
      answer:
        'Go to Profile > Settings > Language to switch between Filipino and English. The app will update immediately after you make your selection.',
    },
  ];
}

const styles = StyleSheet.create({
  heroCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
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
    borderRadius: 14,
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    paddingRight: 12,
  },
  faqAnswer: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
  },
  divider: {
    height: 1,
    marginLeft: 16,
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
    padding: 16,
  },
  reportLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  reportDescription: {
    fontSize: 13,
    marginTop: 2,
  },
});
