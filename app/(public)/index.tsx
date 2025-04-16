import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, useWindowDimensions, Animated, Pressable, ActivityIndicator } from 'react-native';
import { Container, Text, Button, Card } from '../components/UI';
import { SafeIcon } from '../components/UI/SafeIcon';
import { Colors, Spacing, Layout } from '../constants';
import { useRouter } from 'expo-router';
import { getAllServices } from '../lib/db/repositories/serviceRepository';
import { Service as FirebaseService } from '../lib/db/types';

// Define types
interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface Feature {
  id: number;
  title: string;
  description: string;
  icon: string;
}

const HomePage = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // Fetch services from Firebase
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoadingServices(true);
        const firebaseServices = await getAllServices(true); // Only get active services
        
        // Map Firebase service fields to our UI Service type
        const mappedServices = firebaseServices.map(service => ({
          id: service.id,
          title: service.name,
          description: service.description,
          // Assign icon based on category or use a default
          icon: getIconForCategory(service.category),
        }));
        
        setServices(mappedServices);
      } catch (error) {
        console.error('Error fetching services:', error);
        // In case of error, set empty array
        setServices([]);
      } finally {
        setLoadingServices(false);
      }
    };
    
    fetchServices();
  }, []);

  // Helper function to assign icons based on service category
  const getIconForCategory = (category: string): string => {
    const iconMap: Record<string, string> = {
      'Assignment': 'FileText',
      'Essay': 'Edit',
      'Research': 'BookOpen',
      'Exam': 'CheckSquare',
      'Dissertation': 'BookOpen',
      'Presentation': 'Monitor',
      'Thesis': 'Award',
      'Case Study': 'Briefcase',
      'Lab Report': 'Clipboard',
    };
    
    // Return matching icon or default
    return iconMap[category] || 'FileText';
  };

  // Animated values
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const heroOpacity = scrollY.interpolate({
    inputRange: [0, 400],
    outputRange: [1, 0.6],
    extrapolate: 'clamp',
  });

  const features: Feature[] = [
    {
      id: 1,
      title: 'Expert Tutors',
      description: 'Learn from certified professionals with years of experience in their fields',
      icon: 'Users',
    },
    {
      id: 2,
      title: 'Personalized Learning',
      description: 'Tailored approach to meet your specific academic needs and goals',
      icon: 'Target',
    },
    {
      id: 3,
      title: 'Timely Delivery',
      description: 'Guaranteed on-time completion of all assignments and projects',
      icon: 'Clock',
    },
    {
      id: 4,
      title: '24/7 Support',
      description: 'Round-the-clock assistance whenever you need guidance or have questions',
      icon: 'Headphones',
    },
  ];

  // Services Section rendering
  const renderServices = () => {
    if (loadingServices) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading services...</Text>
        </View>
      );
    }

    if (services.length === 0) {
      return (
        <View style={styles.noServicesContainer}>
          <SafeIcon name="Info" size={32} color={Colors.secondary} />
          <Text style={styles.noServicesText}>
            No services available at the moment. Please check back later.
          </Text>
        </View>
      );
    }

    return (
      <View style={[styles.servicesGrid, isMobile && styles.servicesGridMobile]}>
        {services.map((service) => (
          <View 
            key={service.id}
            style={[
              styles.serviceCardWrapper,
              isMobile ? styles.serviceCardWrapperMobile : null
            ]}
          >
            <Pressable 
              onPress={() => router.push('/(auth)/login')}
              style={({pressed}) => [
                {opacity: pressed ? 0.9 : 1},
                {transform: [{ scale: pressed ? 0.98 : 1 }]},
              ]}
            >
              <Card style={styles.serviceCard}>
                <View style={styles.serviceIconContainer}>
                  <SafeIcon 
                    name={service.icon as any} 
                    size={32} 
                    color={Colors.white} 
                  />
                </View>
                <Text variant="h5" weight="semiBold" style={styles.serviceTitle}>
                  {service.title}
                </Text>
                <Text style={styles.serviceDescription}>
                  {service.description}
                </Text>
              </Card>
            </Pressable>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView 
      style={styles.scrollView} 
      showsVerticalScrollIndicator={false}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
      scrollEventThrottle={16}
    >
      {/* Hero Section */}
      <Animated.View style={[styles.heroContainer, { opacity: heroOpacity }]}>
        <View style={styles.heroHeader}>
          <Text variant="h4" weight="bold" style={styles.headerText}>
            Academic Lessons
          </Text>
        </View>
        <View style={styles.heroBackground}>
          <Container style={styles.heroContent}>
            <View style={styles.heroTextContainer}>
          <Text variant="h1" weight="bold" style={styles.heroTitle}>
                Academic Excellence{"\n"}Within Reach
          </Text>
          <Text style={styles.heroSubtitle}>
                Professional academic assistance tailored to your educational journey
          </Text>
          <View style={styles.heroBtnContainer}>
            <Button 
              title="Get Started" 
              size="large" 
              onPress={() => router.push('/(auth)/register')}
              style={styles.heroButton}
            />
            <Button 
              title="Learn More" 
              variant="outline" 
              size="large"
              onPress={() => router.push('/(public)/about')}
              style={styles.heroSecondaryBtn}
              textStyle={styles.heroSecondaryBtnText}
            />
          </View>
        </View>
          </Container>
        </View>
      </Animated.View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <Container>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>1000+</Text>
              <Text style={styles.statLabel}>Completed Projects</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>98%</Text>
              <Text style={styles.statLabel}>Satisfaction Rate</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>24/7</Text>
              <Text style={styles.statLabel}>Support</Text>
            </View>
          </View>
        </Container>
      </View>

      {/* Services Section */}
      <View style={{
        paddingVertical: Spacing.xxl,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
      }}>
        <Container>
          <View style={styles.sectionHeader}>
            <Text variant="h2" weight="bold" style={styles.sectionTitle}>
              Our Services
            </Text>
            <View style={styles.titleUnderline} />
            <Text style={styles.sectionSubtitle}>
              We offer comprehensive academic support designed to help you succeed
            </Text>
          </View>
          
          {renderServices()}
        </Container>
      </View>

      {/* Features Section */}
      <View style={{
        paddingVertical: Spacing.xxl,
        backgroundColor: '#f8f9fa',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.05)',
      }}>
        <Container>
          <View style={styles.sectionHeader}>
            <Text variant="h2" weight="bold" style={styles.sectionTitle}>
              Why Choose Us
            </Text>
            <View style={styles.titleUnderline} />
            <Text style={styles.sectionSubtitle}>
              Discover the advantages that set our academic services apart
            </Text>
          </View>
          
          <View style={[
            styles.featuresGrid, 
            isMobile && styles.featuresGridMobile,
            isTablet && styles.featuresGridTablet
          ]}>
            {features.map((feature) => (
              <View 
                key={feature.id} 
                style={[
                  styles.featureItem,
                  isMobile && { width: '100%' }
                ]}
              >
                <View style={styles.featureIconContainer}>
                  <SafeIcon 
                    name={feature.icon as any} 
                    size={24} 
                    color={Colors.primary} 
                  />
                </View>
                <View style={styles.featureContent}>
                  <Text variant="h5" weight="semiBold" style={styles.featureTitle}>
                    {feature.title}
                  </Text>
                  <Text style={styles.featureDescription}>
                    {feature.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Container>
      </View>

      {/* How It Works Section */}
      <View style={{
        paddingVertical: Spacing.xxl,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.05)',
      }}>
        <Container>
          <View style={styles.sectionHeader}>
            <Text variant="h2" weight="bold" style={styles.sectionTitle}>
              How It Works
            </Text>
            <View style={styles.titleUnderline} />
            <Text style={styles.sectionSubtitle}>
              Our simple three-step process to get the academic help you need
            </Text>
          </View>
          
          <View style={[styles.stepsContainer, isMobile && styles.stepsContainerMobile]}>
            <View style={[
              styles.step,
              isMobile && { width: '100%', marginBottom: Spacing.xl }
            ]}>
              <View style={styles.stepNumberContainer}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <Text variant="h5" weight="semiBold" style={styles.stepTitle}>
                Submit Your Request
              </Text>
              <Text style={styles.stepDescription}>
                Fill out our simple form with your academic requirements
              </Text>
            </View>
            
            {!isMobile && <View style={styles.stepConnector} />}
            
            <View style={[
              styles.step,
              isMobile && { width: '100%', marginBottom: Spacing.xl }
            ]}>
              <View style={styles.stepNumberContainer}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <Text variant="h5" weight="semiBold" style={styles.stepTitle}>
                Get Matched with an Expert
              </Text>
              <Text style={styles.stepDescription}>
                We'll connect you with a qualified specialist in your field
              </Text>
            </View>
            
            {!isMobile && <View style={styles.stepConnector} />}
            
            <View style={[
              styles.step,
              isMobile && { width: '100%', marginBottom: Spacing.xl }
            ]}>
              <View style={styles.stepNumberContainer}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <Text variant="h5" weight="semiBold" style={styles.stepTitle}>
                Receive Your Solution
              </Text>
              <Text style={styles.stepDescription}>
                Get your completed work delivered on time with satisfaction guaranteed
              </Text>
            </View>
          </View>
        </Container>
      </View>

      {/* Call to Action Section */}
      <View style={styles.ctaContainer}>
        <View style={styles.ctaHeader}>
          <Text variant="h4" weight="bold" style={styles.ctaHeaderText}>
            Ready to Excel?
          </Text>
        </View>
        <View style={styles.ctaBackground}>
        <Container>
          <View style={styles.ctaContent}>
            <Text variant="h2" weight="bold" style={styles.ctaTitle}>
              Ready to Excel Academically?
            </Text>
            <Text style={styles.ctaSubtitle}>
                Join thousands of students who have achieved academic success with our support
            </Text>
            <View style={styles.ctaBtnContainer}>
              <Button 
                  title="Get Started Today" 
                  variant="primary" 
                size="large"
                onPress={() => router.push('/(auth)/register')}
                style={styles.ctaButton}
              />
              <Button 
                  title="Learn More" 
                variant="outline"
                size="large"
                  onPress={() => router.push('/(public)/about')}
                style={styles.ctaSecondaryBtn}
                textStyle={styles.ctaSecondaryBtnText}
              />
            </View>
          </View>
        </Container>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  // Hero Section
  heroContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  heroHeader: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  headerText: {
    color: Colors.white,
    fontSize: 20,
  },
  heroBackground: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.xxl,
  },
  heroContent: {
    zIndex: 2,
    position: 'relative',
  },
  heroTextContainer: {
    alignItems: 'center',
  },
  heroTitle: {
    color: Colors.dark,
    textAlign: 'center',
    marginBottom: Spacing.md,
    fontSize: 40,
    lineHeight: 48,
  },
  heroSubtitle: {
    fontSize: 20,
    color: Colors.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    maxWidth: '80%',
  },
  heroBtnContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: Spacing.lg,
  },
  heroButton: {
    marginHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
    minWidth: 160,
    backgroundColor: Colors.primary,
  },
  heroSecondaryBtn: {
    backgroundColor: 'transparent',
    borderColor: Colors.primary,
    marginHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
    minWidth: 160,
  },
  heroSecondaryBtnText: {
    color: Colors.primary,
  },
  // Stats Section
  statsContainer: {
    backgroundColor: Colors.light,
    paddingVertical: Spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: 16,
    color: Colors.secondary,
  },
  // Section Styling
  section: {
    paddingVertical: Spacing.xl,
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
    textAlign: 'center',
    fontSize: 32,
  },
  titleUnderline: {
    width: 80,
    height: 4,
    backgroundColor: Colors.primary,
    marginBottom: Spacing.md,
    borderRadius: 2,
  },
  sectionSubtitle: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
    maxWidth: '80%',
    color: Colors.secondary,
    fontSize: 18,
  },
  // Services Section
  servicesSection: {
    paddingVertical: Spacing.xxl,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  servicesGridMobile: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  serviceCardWrapper: {
    width: '23%', 
    marginBottom: Spacing.lg,
    padding: Spacing.xs,
  },
  serviceCardWrapperMobile: {
    width: '100%',
  },
  serviceCard: {
    padding: Spacing.lg,
    borderRadius: 8,
    elevation: 2,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    backgroundColor: Colors.white,
    height: '100%', // Fill the wrapper height
  },
  serviceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  serviceTitle: {
    marginBottom: Spacing.sm,
    color: Colors.dark,
    fontSize: 18,
  },
  serviceDescription: {
    color: Colors.secondary,
    fontSize: 15,
    lineHeight: 20,
  },
  // Features Section
  featuresSection: {
    paddingVertical: Spacing.xxl,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featuresGridMobile: {
    flexDirection: 'column',
  },
  featuresGridTablet: {
    justifyContent: 'space-around',
  },
  featureItem: {
    width: '48%',
    flexDirection: 'row',
    marginBottom: Spacing.xl,
    alignItems: 'flex-start',
    padding: Spacing.md,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 112, 243, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    marginBottom: Spacing.xs,
    color: Colors.dark,
    fontSize: 18,
  },
  featureDescription: {
    color: Colors.secondary,
    fontSize: 15,
    lineHeight: 20,
  },
  // How It Works Section
  howItWorksSection: {
    paddingVertical: Spacing.xxl,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'relative',
    padding: Spacing.lg,
  },
  stepsContainerMobile: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  step: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.md,
  },
  stepNumberContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  stepNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  stepTitle: {
    marginBottom: Spacing.sm,
    textAlign: 'center',
    color: Colors.dark,
    fontSize: 18,
  },
  stepDescription: {
    textAlign: 'center',
    color: Colors.secondary,
    lineHeight: 20,
  },
  stepConnector: {
    width: '5%',
    height: 2,
    backgroundColor: Colors.primary,
    alignSelf: 'center',
    marginTop: 30,
  },
  // Call to Action Section
  ctaContainer: {
    overflow: 'hidden',
    width: '100%',
  },
  ctaHeader: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  ctaHeaderText: {
    color: Colors.white,
    fontSize: 20,
  },
  ctaBackground: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.xxl,
  },
  ctaContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  ctaTitle: {
    color: Colors.dark,
    textAlign: 'center',
    marginBottom: Spacing.md,
    fontSize: 36,
  },
  ctaSubtitle: {
    color: Colors.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    fontSize: 18,
    maxWidth: '80%',
  },
  ctaBtnContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  ctaButton: {
    marginHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
    minWidth: 180,
    backgroundColor: Colors.primary,
  },
  ctaSecondaryBtn: {
    backgroundColor: 'transparent',
    borderColor: Colors.primary,
    marginHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
    minWidth: 180,
  },
  ctaSecondaryBtnText: {
    color: Colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.primary,
    marginTop: Spacing.md,
  },
  noServicesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noServicesText: {
    color: Colors.secondary,
    marginTop: Spacing.md,
  },
});

export default HomePage; 