import React from 'react';
import { StyleSheet, View, ScrollView, Image } from 'react-native';
import { Container, Text, Button, Card } from '../components/UI';
import { SafeIcon } from '../components/UI/SafeIcon';
import { Colors, Spacing, Layout } from '../constants';
import { useRouter } from 'expo-router';

const AboutPage = () => {
  const router = useRouter();

  const teamMembers = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      role: 'Founder & Academic Director',
      bio: 'Ph.D. in Education with over 15 years of experience in academic research and teaching. Passionate about helping students reach their full potential.',
      avatar: '👩‍🏫',
    },
    {
      id: 2,
      name: 'Prof. Michael Lee',
      role: 'Chief Academic Officer',
      bio: 'Professor of Computer Science with expertise in multiple programming languages and research methodologies. Leads our expert recruitment and quality assurance.',
      avatar: '👨‍💻',
    },
    {
      id: 3,
      name: 'Dr. Emily Chen',
      role: 'Head of Research',
      bio: 'Specializes in research methodology and data analysis. Ensures all our academic services meet the highest standards of academic integrity.',
      avatar: '👩‍🔬',
    },
    {
      id: 4,
      name: 'James Wilson',
      role: 'Client Services Manager',
      bio: "Master's in Business Administration. Dedicated to ensuring excellent client experience and efficient service delivery.",
      avatar: '👨‍💼',
    },
  ];

  const values = [
    {
      id: 1,
      title: 'Academic Excellence',
      description: 'We are committed to maintaining the highest standards of academic quality in all our services.',
      icon: 'BookOpen',
    },
    {
      id: 2,
      title: 'Integrity',
      description: 'We operate with complete transparency and adhere to strict ethical guidelines in all our interactions.',
      icon: 'Shield',
    },
    {
      id: 3,
      title: 'Student Success',
      description: 'We measure our success by the academic achievements and satisfaction of our clients.',
      icon: 'Award',
    },
    {
      id: 4,
      title: 'Accessibility',
      description: 'We strive to make high-quality academic assistance accessible to students of all backgrounds.',
      icon: 'Users',
    },
  ];

  const credentials = [
    'Certified educators with advanced degrees',
    'Published researchers in various fields',
    'Industry professionals with practical experience',
    'Experts vetted through rigorous selection process',
    'Ongoing quality monitoring and evaluation',
  ];

  return (
    <ScrollView style={styles.scrollView}>
      {/* Header Section */}
      <View style={styles.header}>
        <Container>
          <Text variant="h1" weight="bold" style={styles.headerTitle}>
            About Us
          </Text>
          <Text style={styles.headerSubtitle}>
            Learn about our mission, values, and the team behind our services
          </Text>
        </Container>
      </View>

      {/* Mission Section */}
      <Container>
        <Card style={styles.missionCard}>
          <Text variant="h3" weight="bold" style={styles.sectionTitle}>
            Our Mission
          </Text>
          <Text style={styles.missionText}>
            At Academic Lessons, our mission is to empower students to achieve academic excellence through personalized, 
            high-quality educational support. We believe that every student deserves access to the resources and guidance 
            needed to succeed in their academic journey.
          </Text>
          <Text style={styles.missionText}>
            We aim to bridge the gap between classroom learning and individual needs by providing expert assistance that not only 
            helps students complete their assignments but also enhances their understanding of the subject matter.
          </Text>
        </Card>
      </Container>

      {/* Values Section */}
      <View style={styles.valuesSection}>
        <Container>
          <Text variant="h3" weight="bold" style={styles.sectionTitle}>
            Our Values
          </Text>
          
          <View style={styles.valuesGrid}>
            {values.map((value) => (
              <Card key={value.id} style={styles.valueCard}>
                <View style={styles.valueIconContainer}>
                  <SafeIcon name={value.icon as any} size={28} color={Colors.white} />
                </View>
                <Text variant="h5" weight="semiBold" style={styles.valueTitle}>
                  {value.title}
                </Text>
                <Text style={styles.valueDescription}>
                  {value.description}
                </Text>
              </Card>
            ))}
          </View>
        </Container>
      </View>

      {/* Team Section */}
      <Container>
        <Text variant="h3" weight="bold" style={styles.sectionTitle}>
          Meet Our Team
        </Text>
        
        <View style={styles.teamGrid}>
          {teamMembers.map((member) => (
            <Card key={member.id} style={styles.teamCard}>
              <Text style={styles.teamAvatar}>{member.avatar}</Text>
              <Text variant="h5" weight="semiBold" style={styles.teamName}>
                {member.name}
              </Text>
              <Text variant="small" weight="medium" style={styles.teamRole}>
                {member.role}
              </Text>
              <Text style={styles.teamBio}>
                {member.bio}
              </Text>
            </Card>
          ))}
        </View>
      </Container>

      {/* Credentials Section */}
      <View style={styles.credentialsSection}>
        <Container>
          <Text variant="h3" weight="bold" style={styles.sectionTitle}>
            Our Academic Credentials
          </Text>
          <Card style={styles.credentialsCard}>
            <Text style={styles.credentialsIntro}>
              We take pride in the qualifications and expertise of our academic professionals:
            </Text>
            <View style={styles.credentialsList}>
              {credentials.map((credential, index) => (
                <View key={index} style={styles.credentialItem}>
                  <SafeIcon name="Check" size={18} color={Colors.success} />
                  <Text style={styles.credentialText}>{credential}</Text>
                </View>
              ))}
            </View>
          </Card>
        </Container>
      </View>

      {/* Call to Action */}
      <View style={styles.ctaContainer}>
        <Container>
          <Text variant="h3" weight="bold" color={Colors.white} style={styles.ctaTitle}>
            Ready to Experience the Difference?
          </Text>
          <Text color={Colors.white} style={styles.ctaSubtitle}>
            Join our community of successful students today
          </Text>
          <Button 
            title="Get Started" 
            variant="secondary" 
            onPress={() => router.push('/(auth)/register')}
            style={styles.ctaButton}
          />
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
  sectionTitle: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  missionCard: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  missionText: {
    marginBottom: Spacing.md,
    lineHeight: 22,
  },
  valuesSection: {
    backgroundColor: Colors.background,
    paddingVertical: Spacing.xxl,
  },
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  valueCard: {
    width: '48%',
    marginBottom: Spacing.md,
    alignItems: 'center',
    padding: Spacing.md,
  },
  valueIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  valueTitle: {
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  valueDescription: {
    textAlign: 'center',
    fontSize: 14,
  },
  teamGrid: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  teamCard: {
    marginBottom: Spacing.lg,
    alignItems: 'center',
    padding: Spacing.md,
  },
  teamAvatar: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  teamName: {
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  teamRole: {
    textAlign: 'center',
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  teamBio: {
    textAlign: 'center',
    lineHeight: 20,
  },
  credentialsSection: {
    backgroundColor: Colors.background,
    paddingVertical: Spacing.xxl,
  },
  credentialsCard: {
    padding: Spacing.md,
  },
  credentialsIntro: {
    marginBottom: Spacing.md,
  },
  credentialsList: {
    marginTop: Spacing.sm,
  },
  credentialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  credentialText: {
    marginLeft: Spacing.sm,
  },
  ctaContainer: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.xxl,
    marginTop: Spacing.lg,
  },
  ctaTitle: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  ctaSubtitle: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  ctaButton: {
    alignSelf: 'center',
  },
});

export default AboutPage; 