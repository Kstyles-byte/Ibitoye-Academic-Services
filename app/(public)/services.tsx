import React from 'react';
import { StyleSheet, View, ScrollView, Image, ViewStyle } from 'react-native';
import { Container, Text, Button, Card } from '../components/UI';
import { SafeIcon } from '../components/UI/SafeIcon';
import { Colors, Spacing, Layout } from '../constants';
import { useRouter } from 'expo-router';

const ServicesPage = () => {
  const router = useRouter();

  const services = [
    {
      id: 1,
      title: 'Assignment Help',
      description: 'Get expert assistance with all types of academic assignments. Our qualified experts will help you complete your assignments with proper research, formatting, and citations.',
      icon: 'FileText',
      price: '₦5,000',
      features: [
        'Detailed analysis and research',
        'Proper formatting and citations',
        'Plagiarism-free content',
        'On-time delivery',
        'Free revisions'
      ]
    },
    {
      id: 2,
      title: 'Essay Writing',
      description: 'Our professional essay writing service provides well-structured, thoroughly researched essays for all academic levels. We ensure original content that meets your requirements.',
      icon: 'Edit',
      price: '₦7,500',
      features: [
        'Custom written essays',
        'All academic levels',
        'Professional writers',
        'Various subjects available',
        'Free editing and proofreading'
      ]
    },
    {
      id: 3,
      title: 'Research Papers',
      description: 'Get assistance with comprehensive research papers including methodology, data analysis, and findings. We ensure proper academic standards are followed.',
      icon: 'Search',
      price: '₦10,000',
      features: [
        'Thorough literature review',
        'Proper methodology implementation',
        'Data analysis and interpretation',
        'APA, MLA, Chicago formatting',
        'Original research support'
      ]
    },
    {
      id: 4,
      title: 'Thesis & Dissertations',
      description: 'Comprehensive support for your graduate-level research projects. From proposal to final submission, our experts will guide you through the process.',
      icon: 'BookOpen',
      price: '₦15,000+',
      features: [
        'Proposal development',
        'Literature review',
        'Research methodology',
        'Data collection and analysis',
        'Complete dissertation writing'
      ]
    },
    {
      id: 5,
      title: 'Programming Assignments',
      description: 'Get help with coding assignments in various programming languages. Our tech experts will help you with implementation and documentation.',
      icon: 'Code',
      price: '₦8,000',
      features: [
        'Multiple programming languages',
        'Algorithm design',
        'Code documentation',
        'Problem-solving',
        'Debugging assistance'
      ]
    },
    {
      id: 6,
      title: 'Online Exams',
      description: 'Preparation and support for online examinations. Get study materials, practice tests, and expert guidance to excel in your exams.',
      icon: 'FileText',
      price: '₦6,000',
      features: [
        'Study guides and materials',
        'Practice tests',
        'One-on-one tutoring',
        'Subject-specific preparation',
        'Last-minute review sessions'
      ]
    },
  ];

  return (
    <ScrollView style={styles.scrollView}>
      {/* Header Section */}
      <View style={styles.header}>
        <Container>
          <Text variant="h1" weight="bold" style={styles.headerTitle}>
            Our Services
          </Text>
          <Text style={styles.headerSubtitle}>
            Professional academic assistance for all your educational needs
          </Text>
        </Container>
      </View>

      {/* Services List */}
      <Container>
        <View style={styles.servicesContainer}>
          {services.map((service) => (
            <Card key={service.id} style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                <View style={styles.serviceIconContainer}>
                  <SafeIcon 
                    name={service.icon as any} 
                    size={28} 
                    color={Colors.white}
                  />
                </View>
                <Text variant="h4" weight="semiBold" style={styles.serviceTitle}>
                  {service.title}
                </Text>
              </View>
              
              <Text style={styles.serviceDescription}>
                {service.description}
              </Text>
              
              <View style={styles.featuresContainer}>
                <Text weight="semiBold" style={styles.featuresTitle}>
                  What's Included:
                </Text>
                {service.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <SafeIcon name="Check" size={18} color={Colors.success} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.serviceFooter}>
                <View style={styles.priceContainer}>
                  <Text variant="small" style={styles.priceLabel}>Starting at</Text>
                  <Text variant="h4" weight="bold" style={styles.price}>
                    {service.price}
                  </Text>
                </View>
                <Button 
                  title="Request Service" 
                  onPress={() => router.push('/(auth)/login')}
                  size="small"
                />
              </View>
            </Card>
          ))}
        </View>
      </Container>

      {/* Comparison Section */}
      <View style={styles.comparisonSection}>
        <Container>
          <Text variant="h2" weight="bold" style={styles.sectionTitle}>
            Why Choose Us?
          </Text>
          
          <Card style={styles.comparisonCard}>
            <View style={styles.comparisonRow}>
              <View style={styles.comparisonHeader}>
                <Text weight="semiBold" style={styles.comparisonLabel}>Features</Text>
                <Text weight="semiBold" style={styles.comparisonLabel}>Our Service</Text>
                <Text weight="semiBold" style={styles.comparisonLabel}>Others</Text>
              </View>
            </View>
            
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonFeature}>Expert Writers</Text>
              <SafeIcon name="Check" size={24} color={Colors.success} />
              <SafeIcon name="X" size={24} color={Colors.danger} />
            </View>
            
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonFeature}>Plagiarism-Free</Text>
              <SafeIcon name="Check" size={24} color={Colors.success} />
              <SafeIcon name="AlertCircle" size={24} color={Colors.warning} />
            </View>
            
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonFeature}>Free Revisions</Text>
              <SafeIcon name="Check" size={24} color={Colors.success} />
              <SafeIcon name="X" size={24} color={Colors.danger} />
            </View>
            
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonFeature}>On-Time Delivery</Text>
              <SafeIcon name="Check" size={24} color={Colors.success} />
              <SafeIcon name="AlertCircle" size={24} color={Colors.warning} />
            </View>
            
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonFeature}>Customer Support</Text>
              <SafeIcon name="Check" size={24} color={Colors.success} />
              <SafeIcon name="X" size={24} color={Colors.danger} />
            </View>
          </Card>
        </Container>
      </View>

      {/* Call to Action */}
      <View style={styles.ctaContainer}>
        <Container>
          <Text variant="h3" weight="bold" color={Colors.white} style={styles.ctaTitle}>
            Ready to Get Started?
          </Text>
          <Text color={Colors.white} style={styles.ctaSubtitle}>
            Create an account to request academic services
          </Text>
          <View style={styles.ctaButtons}>
            <Button 
              title="Register Now" 
              variant="secondary" 
              onPress={() => router.push('/(auth)/register')}
              style={styles.ctaButton}
            />
            <Button 
              title="Login" 
              variant="outline" 
              onPress={() => router.push('/(auth)/login')}
              style={styles.ctaButton}
              textStyle={{ color: Colors.white }}
            />
          </View>
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
  servicesContainer: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  serviceCard: {
    marginBottom: Spacing.lg,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  serviceIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  serviceTitle: {
    flex: 1,
  },
  serviceDescription: {
    marginBottom: Spacing.md,
  },
  featuresContainer: {
    marginBottom: Spacing.md,
  },
  featuresTitle: {
    marginBottom: Spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  featureText: {
    marginLeft: Spacing.xs,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  priceContainer: {
  },
  priceLabel: {
    color: Colors.muted,
  },
  price: {
    color: Colors.primary,
  },
  comparisonSection: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  comparisonCard: {
    padding: 0,
    overflow: 'hidden',
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  comparisonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    backgroundColor: Colors.light,
  },
  comparisonLabel: {
    flex: 1,
    textAlign: 'center',
  },
  comparisonFeature: {
    flex: 1,
  },
  ctaContainer: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.xxl,
  },
  ctaTitle: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  ctaSubtitle: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  ctaButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  ctaButton: {
    marginHorizontal: Spacing.sm,
    borderColor: Colors.white,
  },
});

export default ServicesPage; 