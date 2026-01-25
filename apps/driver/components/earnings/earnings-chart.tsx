import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface DailyEarning {
  day: string;
  earnings: number;
  trips: number;
}

interface EarningsChartProps {
  dailyEarnings: DailyEarning[];
  maxEarning: number;
}

export function EarningsChart({ dailyEarnings, maxEarning }: EarningsChartProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.container}>
        {dailyEarnings.map((day, index) => {
          const barHeight = maxEarning > 0 ? (day.earnings / maxEarning) * 100 : 0;
          const isToday = index === dailyEarnings.length - 1;

          return (
            <View key={day.day} style={styles.bar}>
              <Text style={[styles.barValue, { color: theme.colors.onSurfaceVariant }]}>
                {day.earnings > 0 ? `₱${day.earnings}` : '-'}
              </Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${Math.max(barHeight, 4)}%`,
                      backgroundColor: isToday ? theme.colors.primary : '#E0E0E0',
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.barLabel,
                  {
                    color: isToday ? theme.colors.primary : theme.colors.onSurfaceVariant,
                    fontWeight: isToday ? '600' : '400',
                  },
                ]}
              >
                {day.day}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  container: {
    flexDirection: 'row',
    height: 160,
    gap: 8,
  },
  bar: {
    flex: 1,
    alignItems: 'center',
  },
  barValue: {
    fontSize: 10,
    marginBottom: 8,
  },
  barTrack: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 11,
    marginTop: 8,
  },
});
