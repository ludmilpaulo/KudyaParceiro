import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { X, HelpCircle, ChevronRight } from 'react-native-feather';

interface HelpSection {
  title: string;
  content: string;
  steps?: string[];
}

interface HelpGuideModalProps {
  visible: boolean;
  onClose: () => void;
  sections: HelpSection[];
  title?: string;
}

const HelpGuideModal: React.FC<HelpGuideModalProps> = ({
  visible,
  onClose,
  sections,
  title = 'Guia de Ajuda',
}) => {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const toggleSection = (index: number) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.headerTitle}>
              <HelpCircle width={24} height={24} color="#0077cc" />
              <Text style={styles.title}>{title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X width={24} height={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.contentScroll}>
            {sections.map((section, index) => (
              <View key={index} style={styles.section}>
                <TouchableOpacity
                  onPress={() => toggleSection(index)}
                  style={styles.sectionHeader}
                >
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <ChevronRight
                    width={20}
                    height={20}
                    color="#0077cc"
                    style={{
                      transform: [
                        { rotate: expandedSection === index ? '90deg' : '0deg' },
                      ],
                    }}
                  />
                </TouchableOpacity>

                {expandedSection === index && (
                  <View style={styles.sectionContent}>
                    <Text style={styles.sectionText}>{section.content}</Text>
                    {section.steps && section.steps.length > 0 && (
                      <View style={styles.stepsContainer}>
                        {section.steps.map((step, stepIndex) => (
                          <View key={stepIndex} style={styles.stepItem}>
                            <View style={styles.stepNumber}>
                              <Text style={styles.stepNumberText}>
                                {stepIndex + 1}
                              </Text>
                            </View>
                            <Text style={styles.stepText}>{step}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity onPress={onClose} style={styles.closeButtonBottom}>
            <Text style={styles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: Dimensions.get('window').width - 40,
    maxHeight: Dimensions.get('window').height - 100,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  contentScroll: {
    maxHeight: Dimensions.get('window').height - 250,
  },
  section: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  sectionContent: {
    padding: 15,
    backgroundColor: 'white',
  },
  sectionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  stepsContainer: {
    marginTop: 10,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0077cc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  closeButtonBottom: {
    marginTop: 20,
    backgroundColor: '#0077cc',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HelpGuideModal;

