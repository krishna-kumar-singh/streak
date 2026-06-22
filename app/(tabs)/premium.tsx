import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Crown, Check, Sparkles, FileText, Zap, Shield, ArrowRight } from 'lucide-react-native';
import { Card, Button, Text as ThemedText } from '@/components/ui';
import { useAuthStore } from '@/shared/store';

const premiumFeatures = [
  { icon: BarChart2, title: 'Advanced Analytics', description: 'Topic mastery, error patterns, retention scores' },
  { icon: Sparkles, title: 'AI Explanations', description: 'Deep explanations for every question' },
  { icon: FileText, title: 'PDF to MCQ', description: 'Upload PDFs and generate custom MCQs' },
  { icon: Shield, title: 'No Ads', description: 'Ad-free practice experience' },
];

const pricingPlans = [
  { id: 'monthly', title: 'Monthly', price: '₹99', period: '/month', tag: null },
  { id: 'yearly', title: 'Yearly', price: '₹949', period: '/year', tag: 'Save 20%', originalPrice: '₹1188' },
];

function BarChart2({ size, color }: { size: number; color: string }) {
  return null;
}

export default function PremiumScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [isProcessing, setIsProcessing] = useState(false);

  const isPremium = profile?.plan === 'premium';

  const handleSubscribe = async () => {
    setIsProcessing(true);
    // In production, integrate with RevenueCat for mobile subscriptions
    // For now, show a message
    setTimeout(() => {
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B', '#0F172A']} style={StyleSheet.absoluteFill} />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: 20 }]}
      >
        <Animated.View entering={FadeInDown} style={styles.header}>
          <View style={styles.crownContainer}>
            <LinearGradient colors={['#F59E0B', '#FBBF24']} style={styles.crown}>
              <Crown size={32} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <ThemedText variant="h1" center style={{ marginTop: 16 }}>
            {isPremium ? 'You are Premium!' : 'Unlock Premium'}
          </ThemedText>
          <ThemedText variant="muted" center style={styles.subtitle}>
            {isPremium
              ? 'Enjoy all premium features'
              : 'Get unlimited access to all features and become an exam topper'}
          </ThemedText>
        </Animated.View>

        {/* Features List */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.features}>
          {premiumFeatures.map((feature, index) => (
            <Animated.View key={feature.title} entering={FadeIn.delay(index * 100)}>
              <Card style={styles.featureCard} padding="md">
                <View style={styles.featureContent}>
                  <View style={styles.featureIcon}>
                    <feature.icon size={24} color="#4F46E5" />
                  </View>
                  <View style={styles.featureText}>
                    <ThemedText variant="h3">{feature.title}</ThemedText>
                    <ThemedText variant="muted" style={{ marginTop: 4 }}>{feature.description}</ThemedText>
                  </View>
                  {isPremium && (
                    <View style={styles.checkmark}>
                      <Check size={20} color="#10B981" />
                    </View>
                  )}
                </View>
              </Card>
            </Animated.View>
          ))}
        </Animated.View>

        {!isPremium && (
          <>
            {/* Pricing Cards */}
            <Animated.View entering={FadeInUp.delay(500)} style={styles.pricingSection}>
              <ThemedText variant="h3" center style={styles.pricingTitle}>Choose Your Plan</ThemedText>
              <View style={styles.plans}>
                {pricingPlans.map((plan) => (
                  <TouchableOpacity
                    key={plan.id}
                    onPress={() => setSelectedPlan(plan.id)}
                    style={styles.planWrapper}
                  >
                    <Card
                      variant={selectedPlan === plan.id ? 'gradient' : 'default'}
                      gradientColors={selectedPlan === plan.id ? ['#4F46E5', '#7C3AED'] : undefined}
                      style={[styles.planCard, selectedPlan === plan.id && styles.planCardSelected]}
                    >
                      {plan.tag && (
                        <View style={styles.popularTag}>
                          <ThemedText variant="label" style={{ color: '#FFFFFF' }}>{plan.tag}</ThemedText>
                        </View>
                      )}
                      <ThemedText variant="h3" style={{ color: selectedPlan === plan.id ? '#FFFFFF' : '#E2E8F0' }}>
                        {plan.title}
                      </ThemedText>
                      <View style={styles.priceRow}>
                        {plan.originalPrice && (
                          <ThemedText variant="muted" style={styles.originalPrice}>
                            {plan.originalPrice}
                          </ThemedText>
                        )}
                        <ThemedText variant="h1" style={{ color: selectedPlan === plan.id ? '#FFFFFF' : '#E2E8F0' }}>
                          {plan.price}
                        </ThemedText>
                        <ThemedText variant="muted">{plan.period}</ThemedText>
                      </View>
                    </Card>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>

            {/* Subscribe Button */}
            <Animated.View entering={FadeInUp.delay(700)} style={styles.ctaSection}>
              <Button
                title="Subscribe Now"
                onPress={handleSubscribe}
                fullWidth
                size="lg"
                loading={isProcessing}
                rightIcon={<ArrowRight size={20} color="#FFFFFF" />}
              />
              <ThemedText variant="muted" center style={styles.termsText}>
                Cancel anytime. No questions asked.
              </ThemedText>
            </Animated.View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scrollContent: { paddingHorizontal: 20 },
  header: { alignItems: 'center', marginBottom: 32 },
  crownContainer: { marginTop: 20 },
  crown: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  subtitle: { marginTop: 8, paddingHorizontal: 20 },
  features: { marginBottom: 32 },
  featureCard: { marginBottom: 8 },
  featureContent: { flexDirection: 'row', alignItems: 'center' },
  featureIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(79, 70, 229, 0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  featureText: { flex: 1 },
  checkmark: { padding: 8 },
  pricingSection: { marginBottom: 24 },
  pricingTitle: { marginBottom: 16 },
  plans: { flexDirection: 'row', gap: 12 },
  planWrapper: { flex: 1 },
  planCard: { position: 'relative', alignItems: 'center', paddingVertical: 20 },
  planCardSelected: { borderWidth: 2, borderColor: '#4F46E5' },
  popularTag: { position: 'absolute', top: -12, backgroundColor: '#F59E0B', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 8 },
  originalPrice: { textDecorationLine: 'line-through', marginRight: 8 },
  ctaSection: { marginBottom: 24 },
  termsText: { marginTop: 12, fontSize: 12 },
});
