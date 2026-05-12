import { View, Text, ScrollView, TouchableOpacity, FlatList, Linking } from 'react-native';
import { useState } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { useAppData } from '@/lib/app-context';
import { useColors } from '@/hooks/use-colors';

export default function CompanyInfoScreen() {
  const colors = useColors();
  const { companyInfo } = useAppData();
  const [selectedTab, setSelectedTab] = useState<'about' | 'board' | 'history' | 'contact'>(
    'about'
  );

  const handlePhoneCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleSocialMedia = (url: string) => {
    Linking.openURL(url);
  };

  const renderBoardMember = ({ item }: { item: (typeof companyInfo.boardMembers)[0] }) => (
    <View className="bg-surface rounded-lg p-4 mb-3 border border-border" style={{ borderColor: colors.border }}>
      <Text className="text-base font-bold text-foreground">{item.name}</Text>
      <Text className="text-sm text-primary font-semibold mt-1">{item.title}</Text>
      <Text className="text-sm text-muted mt-2 leading-relaxed">{item.bio}</Text>
      {(item.email || item.phone) && (
        <View className="flex-row gap-2 mt-3">
          {item.email && (
            <TouchableOpacity
              onPress={() => handleEmail(item.email!)}
              className="flex-1 py-2 rounded bg-primary items-center"
            >
              <Text className="text-xs font-bold text-background">Email</Text>
            </TouchableOpacity>
          )}
          {item.phone && (
            <TouchableOpacity
              onPress={() => handlePhoneCall(item.phone!)}
              className="flex-1 py-2 rounded bg-primary items-center"
            >
              <Text className="text-xs font-bold text-background">Call</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  const renderHistoryItem = ({ item }: { item: (typeof companyInfo.history)[0] }) => (
    <View className="flex-row gap-4 mb-4">
      <View className="items-center">
        <View
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="font-bold text-background">{item.year.toString().slice(-2)}</Text>
        </View>
        <View
          className="w-1 flex-1 mt-2"
          style={{ backgroundColor: colors.border }}
        />
      </View>
      <View className="flex-1 pt-2 pb-4">
        <Text className="text-base font-bold text-foreground">{item.title}</Text>
        <Text className="text-sm text-muted mt-1">{item.description}</Text>
      </View>
    </View>
  );

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold text-foreground mb-4">
          Skones Security Limited
        </Text>

        {/* Tab Buttons */}
        <View className="flex-row gap-2 mb-4 flex-wrap">
          {[
            { id: 'about' as const, label: 'About' },
            { id: 'board' as const, label: 'Board' },
            { id: 'history' as const, label: 'History' },
            { id: 'contact' as const, label: 'Contact' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setSelectedTab(tab.id)}
              className="px-4 py-2 rounded-full"
              style={{
                backgroundColor:
                  selectedTab === tab.id ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                className="font-semibold text-sm"
                style={{
                  color:
                    selectedTab === tab.id ? colors.background : colors.foreground,
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* About Tab */}
        {selectedTab === 'about' && (
          <View>
            <View className="bg-surface rounded-lg p-4 mb-4">
              <Text className="text-lg font-bold text-foreground mb-3">
                About Us
              </Text>
              <Text className="text-sm text-foreground leading-relaxed mb-4">
                {companyInfo.description}
              </Text>

              <Text className="text-base font-bold text-foreground mb-2">
                Founded: {companyInfo.foundedYear}
              </Text>
            </View>

            <View className="bg-surface rounded-lg p-4 mb-4">
              <Text className="text-lg font-bold text-foreground mb-3">
                Mission
              </Text>
              <Text className="text-sm text-foreground leading-relaxed">
                {companyInfo.mission}
              </Text>
            </View>

            <View className="bg-surface rounded-lg p-4 mb-4">
              <Text className="text-lg font-bold text-foreground mb-3">
                Core Values
              </Text>
              <View className="gap-2">
                {companyInfo.values.map((value, index) => (
                  <View key={index} className="flex-row items-center gap-2">
                    <Text className="text-primary text-lg">✓</Text>
                    <Text className="text-sm text-foreground">{value}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className="bg-surface rounded-lg p-4 mb-4">
              <Text className="text-lg font-bold text-foreground mb-3">
                Services
              </Text>
              {companyInfo.services.map((service) => (
                <View key={service.id} className="mb-3">
                  <Text className="text-sm font-bold text-foreground">
                    {service.name}
                  </Text>
                  <Text className="text-xs text-muted mt-1">
                    {service.description}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Board Tab */}
        {selectedTab === 'board' && (
          <View>
            <Text className="text-lg font-bold text-foreground mb-3">
              Board of Directors
            </Text>
            <FlatList
              data={companyInfo.boardMembers}
              renderItem={renderBoardMember}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              nestedScrollEnabled={true}
            />
          </View>
        )}

        {/* History Tab */}
        {selectedTab === 'history' && (
          <View>
            <Text className="text-lg font-bold text-foreground mb-4">
              Company History
            </Text>
            <FlatList
              data={companyInfo.history}
              renderItem={renderHistoryItem}
              keyExtractor={(item) => item.year.toString()}
              scrollEnabled={false}
              nestedScrollEnabled={true}
            />
          </View>
        )}

        {/* Contact Tab */}
        {selectedTab === 'contact' && (
          <View>
            <View className="bg-surface rounded-lg p-4 mb-4">
              <Text className="text-lg font-bold text-foreground mb-3">
                Headquarters
              </Text>
              <View className="gap-3">
                <View>
                  <Text className="text-xs text-muted mb-1">Address</Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {companyInfo.headquarters.address}
                  </Text>
                </View>
                <View>
                  <Text className="text-xs text-muted mb-1">Phone</Text>
                  <TouchableOpacity
                    onPress={() =>
                      handlePhoneCall(companyInfo.headquarters.phone)
                    }
                  >
                    <Text className="text-sm font-semibold text-primary">
                      {companyInfo.headquarters.phone}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View>
                  <Text className="text-xs text-muted mb-1">Email</Text>
                  <TouchableOpacity
                    onPress={() =>
                      handleEmail(companyInfo.headquarters.email)
                    }
                  >
                    <Text className="text-sm font-semibold text-primary">
                      {companyInfo.headquarters.email}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View className="bg-surface rounded-lg p-4 mb-4">
              <Text className="text-lg font-bold text-foreground mb-3">
                Follow Us
              </Text>
              <View className="gap-2">
                {companyInfo.socialMedia.facebook && (
                  <TouchableOpacity
                    onPress={() =>
                      handleSocialMedia(companyInfo.socialMedia.facebook!)
                    }
                    className="py-3 rounded-lg items-center border border-border"
                    style={{ borderColor: colors.border }}
                  >
                    <Text className="text-sm font-bold text-primary">
                      Facebook
                    </Text>
                  </TouchableOpacity>
                )}
                {companyInfo.socialMedia.instagram && (
                  <TouchableOpacity
                    onPress={() =>
                      handleSocialMedia(companyInfo.socialMedia.instagram!)
                    }
                    className="py-3 rounded-lg items-center border border-border"
                    style={{ borderColor: colors.border }}
                  >
                    <Text className="text-sm font-bold text-primary">
                      Instagram
                    </Text>
                  </TouchableOpacity>
                )}
                {companyInfo.socialMedia.tiktok && (
                  <TouchableOpacity
                    onPress={() =>
                      handleSocialMedia(companyInfo.socialMedia.tiktok!)
                    }
                    className="py-3 rounded-lg items-center border border-border"
                    style={{ borderColor: colors.border }}
                  >
                    <Text className="text-sm font-bold text-primary">
                      TikTok
                    </Text>
                  </TouchableOpacity>
                )}
                {companyInfo.socialMedia.whatsapp && (
                  <TouchableOpacity
                    onPress={() =>
                      handleSocialMedia(companyInfo.socialMedia.whatsapp!)
                    }
                    className="py-3 rounded-lg items-center border border-border"
                    style={{ borderColor: colors.border }}
                  >
                    <Text className="text-sm font-bold text-primary">
                      WhatsApp
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
