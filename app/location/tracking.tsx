import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { trpc } from '@/lib/trpc';
import * as Location from 'expo-location';
import { Cloud, CloudRain, Wind, MapPin, Navigation2, AlertTriangle } from 'lucide-react-native';
import { format } from 'date-fns';

interface GuardLocation {
  guardId: string;
  guardName: string;
  latitude: number;
  longitude: number;
  address: string;
  timestamp: Date;
  status: 'on_duty' | 'break' | 'off_duty';
}

const WeatherCard = ({ weather }: { weather: any }) => {
  const getWeatherIcon = (condition: string) => {
    if (condition.includes('Rain')) return <CloudRain size={32} color="#3b82f6" />;
    return <Cloud size={32} color="#fbbf24" />;
  };

  return (
    <View style={styles.weatherCard}>
      <View style={styles.weatherTop}>
        {getWeatherIcon(weather.condition)}
        <View style={styles.weatherInfo}>
          <ThemedText style={styles.temperature}>{weather.temperature}°C</ThemedText>
          <ThemedText style={styles.condition}>{weather.condition}</ThemedText>
        </View>
      </View>
      <View style={styles.weatherDetails}>
        <View style={styles.weatherDetail}>
          <ThemedText style={styles.detailLabel}>Humidity</ThemedText>
          <ThemedText style={styles.detailValue}>{weather.humidity}%</ThemedText>
        </View>
        <View style={styles.weatherDetail}>
          <Wind size={16} color="#666" />
          <ThemedText style={styles.detailLabel}>Wind Speed</ThemedText>
          <ThemedText style={styles.detailValue}>{weather.windSpeed} m/s</ThemedText>
        </View>
      </View>
    </View>
  );
};

const LocationTrackingCard = ({ location }: { location: GuardLocation }) => {
  return (
    <View style={styles.locationCard}>
      <View style={styles.locationHeader}>
        <MapPin size={20} color="#3b82f6" />
        <View style={styles.locationInfo}>
          <ThemedText style={styles.guardName}>{location.guardName}</ThemedText>
          <ThemedText style={styles.guardId}>{location.guardId}</ThemedText>
        </View>
      </View>

      <ThemedText style={styles.address}>{location.address}</ThemedText>

      <View style={styles.locationMeta}>
        <ThemedText style={styles.metaText}>
          Lat: {location.latitude.toFixed(4)}, Lon: {location.longitude.toFixed(4)}
        </ThemedText>
        <ThemedText style={styles.metaText}>
          {format(new Date(location.timestamp), 'HH:mm:ss')}
        </ThemedText>
      </View>

      <View style={[styles.statusBadge, { backgroundColor: location.status === 'on_duty' ? '#10b981' : '#f59e0b' }]}>
        <ThemedText style={styles.statusText}>{location.status.replace('_', ' ').toUpperCase()}</ThemedText>
      </View>
    </View>
  );
};

const LocationServices = () => {
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data: weather, isLoading: weatherLoading } = trpc.externalApis.getWeather.useQuery(
    currentLocation ? { latitude: currentLocation.coords.latitude, longitude: currentLocation.coords.longitude } : undefined,
    { enabled: !!currentLocation }
  );

  const { data: guardsNearby } = trpc.externalApis.getGuardsNearLocation.useQuery(
    currentLocation ? { latitude: currentLocation.coords.latitude, longitude: currentLocation.coords.longitude, radiusKm: 5 } : undefined,
    { enabled: !!currentLocation }
  );

  const trackLocationMutation = trpc.externalApis.trackGuardLocation.useMutation();

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      if (status === 'granted') {
        getCurrentLocation();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request location permission');
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setCurrentLocation(location);
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const handleTrackGuard = async (guardId: string) => {
    if (!currentLocation) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    setRefreshing(true);
    try {
      await trackLocationMutation.mutateAsync({
        guardId,
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      Alert.alert('Success', 'Guard location tracked');
    } catch (error) {
      Alert.alert('Error', 'Failed to track guard location');
    } finally {
      setRefreshing(false);
    }
  };

  if (!locationPermission) {
    return (
      <ThemedView style={styles.centered}>
        <AlertTriangle size={48} color="#dc2626" />
        <ThemedText style={styles.errorText}>Location permission required</ThemedText>
        <TouchableOpacity style={styles.button} onPress={requestLocationPermission}>
          <ThemedText style={styles.buttonText}>Grant Permission</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Current Location */}
        {currentLocation && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Your Location</ThemedText>
            <View style={styles.currentLocationCard}>
              <Navigation2 size={20} color="#3b82f6" />
              <View style={styles.locationDetails}>
                <ThemedText style={styles.coordinateText}>
                  {currentLocation.coords.latitude.toFixed(4)}, {currentLocation.coords.longitude.toFixed(4)}
                </ThemedText>
                <ThemedText style={styles.accuracyText}>
                  Accuracy: ±{Math.round(currentLocation.coords.accuracy)}m
                </ThemedText>
              </View>
            </View>
          </View>
        )}

        {/* Weather Information */}
        {weather && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Weather Conditions</ThemedText>
            {weatherLoading ? (
              <ActivityIndicator size="large" />
            ) : (
              <WeatherCard weather={weather} />
            )}
          </View>
        )}

        {/* Guards Nearby */}
        {guardsNearby && guardsNearby.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Guards Nearby (5 km)</ThemedText>
            {guardsNearby.map((guard: GuardLocation, idx: number) => (
              <View key={idx}>
                <LocationTrackingCard location={guard} />
                <TouchableOpacity
                  style={styles.trackButton}
                  onPress={() => handleTrackGuard(guard.guardId)}
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <ThemedText style={styles.trackButtonText}>Track Location</ThemedText>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Refresh Button */}
        <TouchableOpacity style={styles.refreshButton} onPress={getCurrentLocation} disabled={refreshing}>
          <ThemedText style={styles.refreshButtonText}>Refresh Location</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollView: {
    paddingVertical: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    marginVertical: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  currentLocationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
  },
  locationDetails: {
    marginLeft: 12,
    flex: 1,
  },
  coordinateText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  accuracyText: {
    fontSize: 12,
    color: '#666',
  },
  weatherCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  weatherTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  weatherInfo: {
    marginLeft: 12,
  },
  temperature: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  condition: {
    fontSize: 14,
    color: '#666',
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  weatherDetail: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  locationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationInfo: {
    marginLeft: 12,
    flex: 1,
  },
  guardName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  guardId: {
    fontSize: 12,
    color: '#666',
  },
  address: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  locationMeta: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 11,
    color: '#666',
    marginVertical: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  trackButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  trackButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LocationServices;
