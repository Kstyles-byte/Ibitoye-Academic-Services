import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Container, Text, Card } from '../components/UI';
import { Colors, Spacing } from '../constants';
import { Ionicons } from '@expo/vector-icons';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

interface FAQCategory {
  id: number;
  title: string;
  items: FAQItem[];
}

const FAQPage = () => {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});

  const toggleItem = (id: number) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const faqCategories: FAQCategory[] = [
    {
      id: 1,
      title: 'General Questions',
      items: [
        {
          id: 101,
          question: 'What is Academic Lessons?',
          answer: 'Academic Lessons is a professional academic service provider that helps students with various academic needs, including assignments, essays, research papers, and more. We connect students with expert tutors who provide high-quality academic assistance.'
        },
        {
          id: 102,
          question: 'Is using your service considered cheating?',
          answer: 'Our service is designed to provide educational support and guidance. We encourage students to use our materials as a reference and learning tool to enhance their understanding of the subject matter. The work we provide should be used in accordance with your institution\'s academic integrity policies.'
        },
        {
          id: 103,
          question: 'How do I get started with your service?',
          answer: 'To get started, you need to create an account on our platform, then submit a service request detailing your academic needs. Our team will review your request and match you with an appropriate expert.'
        },
      ]
    },
    {
      id: 2,
      title: 'Services & Pricing',
      items: [
        {
          id: 201,
          question: 'What services do you offer?',
          answer: 'We offer a wide range of academic services including assignment help, essay writing, research papers, thesis and dissertation assistance, programming assignments, and online exam preparation.'
        },
        {
          id: 202,
          question: 'How much do your services cost?',
          answer: 'Our pricing varies depending on the type of service, academic level, deadline, and complexity. You can view our starting prices on the Services page. For a detailed quote, submit a service request with your specific requirements.'
        },
        {
          id: 203,
          question: 'Do you offer discounts for returning customers?',
          answer: "Yes, we offer loyalty discounts for returning customers. After your first completed service, you'll be eligible for special rates on future requests."
        },
      ]
    },
    {
      id: 3,
      title: 'Process & Timeline',
      items: [
        {
          id: 301,
          question: 'How long does it take to complete a request?',
          answer: 'The turnaround time depends on the complexity and length of your request. We work with your specified deadline, and our experts are trained to deliver quality work on time. Rush options are available for urgent requests.'
        },
        {
          id: 302,
          question: 'What if I need revisions to the completed work?',
          answer: 'We offer free revisions within a specified period after delivery. If you need any changes to the completed work, simply submit a revision request, and your expert will make the necessary adjustments.'
        },
        {
          id: 303,
          question: 'How do I communicate with my assigned expert?',
          answer: 'Once an expert is assigned to your request, you can communicate with them through our messaging system. You can ask questions, provide additional information, or request updates on your project.'
        },
      ]
    },
    {
      id: 4,
      title: 'Payment & Security',
      items: [
        {
          id: 401,
          question: 'What payment methods do you accept?',
          answer: 'We accept various payment methods, including credit/debit cards, bank transfers, and mobile payment options. All payments are processed securely through our trusted payment gateways.'
        },
        {
          id: 402,
          question: 'Is my personal information secure?',
          answer: 'Yes, we take data security very seriously. All personal information is encrypted and stored securely. We never share your information with third parties without your consent.'
        },
        {
          id: 403,
          question: "Do you offer refunds if I'm not satisfied?",
          answer: "Yes, we have a satisfaction guarantee policy. If you're not satisfied with the quality of work, you can request a revision. If issues persist, you may be eligible for a partial or full refund depending on the circumstances."
        },
      ]
    },
  ];

  return (
    <ScrollView style={styles.scrollView}>
      {/* Header Section */}
      <View style={styles.header}>
        <Container>
          <Text variant="h1" weight="bold" style={styles.headerTitle}>
            Frequently Asked Questions
          </Text>
          <Text style={styles.headerSubtitle}>
            Find answers to common questions about our services
          </Text>
        </Container>
      </View>

      {/* FAQ Categories */}
      <Container>
        {faqCategories.map(category => (
          <View key={category.id} style={styles.categoryContainer}>
            <Text variant="h3" weight="bold" style={styles.categoryTitle}>
              {category.title}
            </Text>
            
            <Card style={styles.faqCard}>
              {category.items.map(item => (
                <View key={item.id} style={styles.faqItem}>
                  <TouchableOpacity 
                    style={styles.questionContainer} 
                    onPress={() => toggleItem(item.id)}
                    activeOpacity={0.7}
                  >
                    <Text weight="semiBold" style={styles.question}>
                      {item.question}
                    </Text>
                    <Ionicons 
                      name={expandedItems[item.id] ? 'chevron-up' : 'chevron-down'} 
                      size={24} 
                      color={Colors.primary}
                    />
                  </TouchableOpacity>
                  
                  {expandedItems[item.id] && (
                    <View style={styles.answerContainer}>
                      <Text style={styles.answer}>{item.answer}</Text>
                    </View>
                  )}
                </View>
              ))}
            </Card>
          </View>
        ))}
      </Container>

      {/* Still Have Questions */}
      <View style={styles.contactSection}>
        <Container>
          <Card style={styles.contactCard}>
            <Text variant="h4" weight="bold" style={styles.contactTitle}>
              Still Have Questions?
            </Text>
            <Text style={styles.contactText}>
              If you couldn't find the answer to your question, feel free to contact us directly.
            </Text>
            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <Ionicons name="mail" size={24} color={Colors.primary} />
                <Text style={styles.contactDetail}>support@academiclessons.com</Text>
              </View>
              <View style={styles.contactItem}>
                <Ionicons name="call" size={24} color={Colors.primary} />
                <Text style={styles.contactDetail}>+234 800 123 4567</Text>
              </View>
              <View style={styles.contactItem}>
                <Ionicons name="time" size={24} color={Colors.primary} />
                <Text style={styles.contactDetail}>Support Hours: 9am - 9pm (Mon-Fri)</Text>
              </View>
            </View>
          </Card>
        </Container>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxl,
  },
  headerTitle: {
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.white,
    textAlign: 'center',
  },
  categoryContainer: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  categoryTitle: {
    marginBottom: Spacing.md,
  },
  faqCard: {
    padding: 0,
    overflow: 'hidden',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  question: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  answerContainer: {
    padding: Spacing.md,
    paddingTop: 0,
    backgroundColor: Colors.background,
  },
  answer: {
    lineHeight: 22,
  },
  contactSection: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  contactCard: {
    alignItems: 'center',
  },
  contactTitle: {
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  contactText: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  contactInfo: {
    width: '100%',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  contactDetail: {
    marginLeft: Spacing.md,
  },
});

export default FAQPage; 