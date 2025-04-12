import React, { useState } from 'react';
import { View, Platform, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Text } from './Text';
import { Colors, Spacing, Layout } from '../../constants';
import { SafeIcon } from './SafeIcon';

interface DatePickerProps {
  date: Date;
  onDateChange: (date: Date) => void;
  label?: string;
  placeholder?: string;
  errorMessage?: string;
  minimumDate?: Date;
  maximumDate?: Date;
}

/**
 * A cross-platform date picker component
 * - On iOS: Opens a modal with a date picker
 * - On Android: Shows native date picker
 * - On Web: Uses HTML date input
 */
export const DatePicker: React.FC<DatePickerProps> = ({
  date,
  onDateChange,
  label,
  placeholder = 'Select a date',
  errorMessage,
  minimumDate,
  maximumDate
}) => {
  const [showPicker, setShowPicker] = useState(false);
  
  // Format date as YYYY-MM-DD for display
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format date for display to user (more readable)
  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle date selection
  const handleDateChange = (event: any, selectedDate?: Date) => {
    // For Android, the picker closes automatically
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedDate) {
      onDateChange(selectedDate);
    }
  };

  // Toggle date picker visibility (for iOS)
  const toggleDatePicker = () => {
    setShowPicker(!showPicker);
  };

  // Confirm date selection (for iOS)
  const confirmIOSDate = () => {
    setShowPicker(false);
  };

  // Display date field based on platform
  const renderDatePicker = () => {
    // Web platform uses HTML date input
    if (Platform.OS === 'web') {
      return (
        <input
          type="date"
          value={formatDate(date)}
          onChange={(e) => {
            if (e.target.value) {
              onDateChange(new Date(e.target.value));
            }
          }}
          min={minimumDate ? formatDate(minimumDate) : undefined}
          max={maximumDate ? formatDate(maximumDate) : undefined}
          style={{
            border: `1px solid ${errorMessage ? Colors.danger : '#ddd'}`,
            borderRadius: Layout.borderRadius.small,
            padding: 12,
            width: '100%',
            fontSize: 16,
          }}
        />
      );
    }

    // Android and iOS date pickers
    return (
      <>
        <TouchableOpacity 
          style={[
            styles.dateInput,
            errorMessage ? styles.inputError : null
          ]}
          onPress={toggleDatePicker}
        >
          <Text style={date ? styles.dateText : styles.placeholderText}>
            {date ? formatDateForDisplay(date) : placeholder}
          </Text>
          <SafeIcon name="Calendar" size={20} color={Colors.muted} />
        </TouchableOpacity>

        {/* Show the date picker based on platform */}
        {showPicker && (
          Platform.OS === 'ios' ? (
            <Modal
              visible={showPicker}
              transparent={true}
              animationType="slide"
            >
              <View style={styles.iosPickerModal}>
                <View style={styles.iosPickerContainer}>
                  <View style={styles.iosPickerHeader}>
                    <TouchableOpacity onPress={() => setShowPicker(false)}>
                      <Text style={styles.iosPickerCancel}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={confirmIOSDate}>
                      <Text style={styles.iosPickerDone}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    minimumDate={minimumDate}
                    maximumDate={maximumDate}
                  />
                </View>
              </View>
            </Modal>
          ) : (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
            />
          )
        )}
      </>
    );
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      {renderDatePicker()}
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    marginBottom: Spacing.xs,
    fontWeight: '500',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: Layout.borderRadius.small,
    padding: Spacing.sm,
    backgroundColor: 'white',
  },
  inputError: {
    borderColor: Colors.danger,
  },
  dateText: {
    fontSize: 16,
  },
  placeholderText: {
    fontSize: 16,
    color: Colors.muted,
  },
  errorText: {
    color: Colors.danger,
    marginTop: Spacing.xs,
    fontSize: 14,
  },
  iosPickerModal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  iosPickerContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  iosPickerCancel: {
    color: Colors.muted,
    fontSize: 16,
  },
  iosPickerDone: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
}); 