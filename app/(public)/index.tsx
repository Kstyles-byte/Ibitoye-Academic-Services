import React from 'react';
import { StyleSheet, View, Image, ScrollView, Dimensions, ImageBackground, useWindowDimensions } from 'react-native';
import { Container, Text, Button, Card } from '../components/UI';
import { Colors, Spacing, Layout } from '../constants';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Define the type for testimonial objects
interface Testimonial {
  id: number;
  name: string;
  text: string;
  avatar: string;
  rating: number;
}

// Define the type for service objects
interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
}

const HomePage = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const services: Service[] = [
    {
      id: 1,
      title: 'Assignment Help',
      description: 'Expert assistance with all types of academic assignments',
      icon: 'document-text',
    },
    {
      id: 2,
      title: 'Essay Writing',
      description: 'Professional essay writing services for all academic levels',
      icon: 'pencil',
    },
    {
      id: 3,
      title: 'Research Papers',
      description: 'In-depth research and well-structured papers with proper citations',
      icon: 'newspaper',
    },
    {
      id: 4,
      title: 'Thesis & Dissertations',
      description: 'Comprehensive support for graduate-level research projects',
      icon: 'school',
    },
  ];

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Sarah K.',
      text: 'The service was excellent! My assignment was completed on time and the quality exceeded my expectations.',
      avatar: '👩‍🎓',
      rating: 5,
    },
    {
      id: 2,
      name: 'Michael T.',
      text: 'I was struggling with my research paper until I found this service. The expert helped me understand the topic better and improve my work.',
      avatar: '👨‍🎓',
      rating: 5,
    },
    {
      id: 3,
      name: 'Jenny L.',
      text: 'Very professional service. Communication was clear, and they delivered exactly what I needed for my dissertation.',
      avatar: '👩‍🔬',
      rating: 4,
    },
  ];

  const renderRatingStars = (rating: number) => {
    return (
      <View style={styles.ratingContainer}>
        {[...Array(5)].map((_, i) => (
          <Ionicons
            key={i}
            name={i < rating ? "star" : "star-outline"}
            size={16}
            color={i < rating ? Colors.warning : Colors.secondary}
            style={styles.starIcon}
          />
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.heroContainer}>
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <Text variant="h1" weight="bold" style={styles.heroTitle}>
            Academic Excellence{"\n"}Made Simple1
          </Text>
          <Text style={styles.heroSubtitle}>
            Professional assistance for your academic journey
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
      </View>

      {/* Services Section */}
      <Container style={styles.sectionContainer}>
        <View style={styles.sectionHeading}>
          <Text variant="h2" weight="bold" style={styles.sectionTitle}>
            Our Services
          </Text>
          <View style={styles.titleUnderline} />
          <Text style={styles.sectionSubtitle}>
            We offer a wide range of academic services to help you succeed
          </Text>
        </View>
        
        <View style={isMobile ? styles.servicesGridMobile : styles.servicesGrid}>
          {services.map((service) => (
            <Card key={service.id} style={isMobile ? styles.serviceCardMobile : styles.serviceCard}>
              <View style={styles.serviceIconContainer}>
                <Ionicons 
                  name={service.icon as any} 
                  size={40} 
                  color={Colors.white} 
                />
              </View>
              <Text variant="h5" weight="semiBold" style={styles.serviceTitle}>
                {service.title}
              </Text>
              <Text variant="small" style={styles.serviceDescription}>
                {service.description}
              </Text>
            </Card>
          ))}
        </View>
        
        <Button 
          title="View All Services" 
          variant="outline" 
          onPress={() => router.push('/(public)/services')}
          style={styles.servicesButton}
        />
      </Container>

      {/* How It Works Section */}
      <View style={styles.howItWorksContainer}>
        <Container>
          <View style={styles.sectionHeading}>
            <Text variant="h2" weight="bold" style={styles.sectionTitle}>
              How It Works
            </Text>
            <View style={styles.titleUnderline} />
          </View>
          
          <View style={isMobile ? styles.stepsContainerMobile : styles.stepsContainer}>
            <View style={styles.stepConnector} />
            {!isMobile && <View style={styles.stepConnectorLine} />}
            
            <View style={isMobile ? styles.stepMobile : styles.step}>
              <View style={styles.stepNumberContainer}>
                <Text variant="h3" weight="bold" color={Colors.white}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text variant="h4" weight="semiBold" style={styles.stepTitle}>
                  Submit Your Request
                </Text>
                <Text style={styles.stepDescription}>
                  Fill out the service request form with your requirements and academic level
                </Text>
              </View>
            </View>
            
            <View style={isMobile ? styles.stepMobile : styles.step}>
              <View style={styles.stepNumberContainer}>
                <Text variant="h3" weight="bold" color={Colors.white}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text variant="h4" weight="semiBold" style={styles.stepTitle}>
                  Get Matched With an Expert
                </Text>
                <Text style={styles.stepDescription}>
                  We'll match you with a qualified expert in your field based on your specific needs
                </Text>
              </View>
            </View>
            
            <View style={isMobile ? styles.stepMobile : styles.step}>
              <View style={styles.stepNumberContainer}>
                <Text variant="h3" weight="bold" color={Colors.white}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text variant="h4" weight="semiBold" style={styles.stepTitle}>
                  Receive Your Solution
                </Text>
                <Text style={styles.stepDescription}>
                  Get your completed work delivered on time with guaranteed quality and satisfaction
                </Text>
              </View>
            </View>
          </View>
        </Container>
      </View>

      {/* Testimonials Section */}
      <Container style={styles.sectionContainer}>
        <View style={styles.sectionHeading}>
          <Text variant="h2" weight="bold" style={styles.sectionTitle}>
            What Our Clients Say
          </Text>
          <View style={styles.titleUnderline} />
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.testimonialScroll}
          contentContainerStyle={styles.testimonialScrollContent}
        >
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} style={styles.testimonialCard}>
              <Text style={styles.testimonialAvatar}>{testimonial.avatar}</Text>
              <Text variant="h5" weight="semiBold" style={styles.testimonialName}>
                {testimonial.name}
              </Text>
              {renderRatingStars(testimonial.rating)}
              <Text style={styles.testimonialText}>
                "{testimonial.text}"
              </Text>
            </Card>
          ))}
        </ScrollView>
      </Container>

      {/* Statistics Section */}
      <View style={styles.statsContainer}>
        <Container>
          <View style={isMobile ? styles.statsGridMobile : styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>1000+</Text>
              <Text style={styles.statLabel}>Completed Projects</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>98%</Text>
              <Text style={styles.statLabel}>Satisfaction Rate</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>50+</Text>
              <Text style={styles.statLabel}>Expert Tutors</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>24/7</Text>
              <Text style={styles.statLabel}>Customer Support</Text>
            </View>
          </View>
        </Container>
      </View>

      {/* Call to Action */}
      <View style={styles.ctaContainer}>
        <Container>
          <View style={styles.ctaContent}>
            <Text variant="h2" weight="bold" style={styles.ctaTitle}>
              Ready to Excel Academically?
            </Text>
            <Text style={styles.ctaSubtitle}>
              Join thousands of students who trust our services for their academic needs
            </Text>
            <View style={styles.ctaBtnContainer}>
              <Button 
                title="Create an Account" 
                variant="secondary" 
                size="large"
                onPress={() => router.push('/(auth)/register')}
                style={styles.ctaButton}
              />
              <Button 
                title="Contact Us" 
                variant="outline"
                size="large"
                onPress={() => router.push('/(public)/contact')}
                style={styles.ctaSecondaryBtn}
                textStyle={styles.ctaSecondaryBtnText}
              />
            </View>
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
  heroContainer: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.xxl * 2,
    paddingHorizontal: Spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
    zIndex: 1,
    opacity: 0.85,
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 2,
    position: 'relative',
  },
  heroTitle: {
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.md,
    fontSize: 36,
    lineHeight: 44,
  },
  heroSubtitle: {
    fontSize: 20,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    maxWidth: '80%',
  },
  heroBtnContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: Spacing.md,
  },
  heroButton: {
    marginHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
    minWidth: 150,
  },
  heroSecondaryBtn: {
    backgroundColor: 'transparent',
    borderColor: Colors.white,
    marginHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
    minWidth: 150,
  },
  heroSecondaryBtnText: {
    color: Colors.white,
  },
  sectionContainer: {
    paddingVertical: Spacing.xxl,
  },
  sectionHeading: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  titleUnderline: {
    width: 80,
    height: 4,
    backgroundColor: Colors.primary,
    marginBottom: Spacing.md,
  },
  sectionSubtitle: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
    maxWidth: '80%',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  servicesGridMobile: {
    flexDirection: 'column',
    marginBottom: Spacing.xl,
  },
  serviceCard: {
    width: '48%',
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderRadius: 16,
    elevation: 4,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  serviceCardMobile: {
    width: '100%',
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderRadius: 16,
    elevation: 4,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  serviceIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  serviceTitle: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  serviceDescription: {
    textAlign: 'center',
  },
  servicesButton: {
    alignSelf: 'center',
    marginVertical: Spacing.lg,
    minWidth: 200,
  },
  howItWorksContainer: {
    paddingVertical: Spacing.xxl,
    position: 'relative',
    backgroundColor: '#f0f4f8',
  },
  stepsContainer: {
    marginTop: Spacing.xl,
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
  },
  stepsContainerMobile: {
    marginTop: Spacing.xl,
    position: 'relative',
    flexDirection: 'column',
    paddingHorizontal: Spacing.md,
  },
  stepConnector: {
    position: 'absolute',
    top: '50%',
    left: '10%',
    right: '10%',
    height: 3,
    backgroundColor: Colors.primary,
    opacity: 0.3,
    zIndex: 1,
  },
  stepConnectorLine: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: 3,
    height: '100%',
    backgroundColor: Colors.primary,
    opacity: 0.3,
    zIndex: 1,
  },
  step: {
    width: '30%',
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
    backgroundColor: '#f0f4f8',
    paddingHorizontal: Spacing.md,
  },
  stepMobile: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: Spacing.xl,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    position: 'relative',
    zIndex: 2,
    alignItems: 'flex-start',
  },
  stepContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  stepNumberContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    zIndex: 2,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  stepTitle: {
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  stepDescription: {
    textAlign: 'center',
  },
  testimonialScroll: {
    marginTop: Spacing.lg,
  },
  testimonialScrollContent: {
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  testimonialCard: {
    width: 320,
    marginRight: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 16,
    elevation: 4,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  testimonialAvatar: {
    fontSize: 60,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  testimonialName: {
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  starIcon: {
    marginHorizontal: 2,
  },
  testimonialText: {
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
  },
  statsContainer: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.xxl,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  statsGridMobile: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  statItem: {
    width: '24%',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
  },
  ctaContainer: {
    backgroundColor: '#0a2463',
    paddingVertical: Spacing.xxl,
  },
  ctaContent: {
    alignItems: 'center',
  },
  ctaTitle: {
    color: '#000000',
    textAlign: 'center',
    marginBottom: Spacing.md,
    fontSize: 32,
  },
  ctaSubtitle: {
    color: '#000000',
    textAlign: 'center',
    marginBottom: Spacing.xl,
    fontSize: 18,
    maxWidth: '80%',
  },
  ctaBtnContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  ctaButton: {
    marginHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
    minWidth: 180,
  },
  ctaSecondaryBtn: {
    backgroundColor: 'transparent',
    borderColor: '#4dabf7',
    marginHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
    minWidth: 180,
  },
  ctaSecondaryBtnText: {
    color: '#4dabf7',
  },
});

export default HomePage; 