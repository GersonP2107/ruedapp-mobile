import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { RuntConsultationScreen } from './RuntConsultationScreen';
import VehicleRegistrationScreen from './VehicleRegistrationScreen';
import { RuntVehicleData } from '../../../infrastructure/services/RuntSimulationService';

type RegistrationStep = 'runt_consultation' | 'manual_registration';

export default function VehicleRegistrationFlowScreen() {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('runt_consultation');
  const [runtData, setRuntData] = useState<RuntVehicleData | null>(null);

  const handleVehicleFound = (vehicleData: RuntVehicleData) => {
    setRuntData(vehicleData);
    setCurrentStep('manual_registration');
  };

  const handleSkipRunt = () => {
    setRuntData(null);
    setCurrentStep('manual_registration');
  };

  const handleBackToRunt = () => {
    setCurrentStep('runt_consultation');
  };

  return (
    <View style={styles.container}>
      {currentStep === 'runt_consultation' && (
        <RuntConsultationScreen
          onVehicleFound={handleVehicleFound}
          onSkip={handleSkipRunt}
        />
      )}
      
      {currentStep === 'manual_registration' && (
        <VehicleRegistrationScreen
          prefilledData={runtData}
          onBackToRunt={runtData ? handleBackToRunt : undefined}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});