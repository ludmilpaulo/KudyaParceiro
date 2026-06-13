import React, { useEffect, useState } from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, selectUser } from '../redux/slices/authSlice';
import { useTranslation } from '../hooks/useTranslation';
import CategoryPartnerDashboard from '../screens/partner/CategoryPartnerDashboard';
import Profile from '../components/restaurant/Profile';
import { fetchBusinessCategories, type BusinessCategory } from '../services/platformApi';
import { getPartnerCategorySlug } from '../utils/partnerRoles';
import { useLanguage } from '../contexts/LanguageContext';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  return (
    <LinearGradient colors={['#FCB61A', '#0171CE']} style={styles.drawerContent}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerBrand}>{t('partnerAppName')}</Text>
      </View>
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
        <DrawerItem
          label={t('logout')}
          icon={() => <Ionicons name="log-out-outline" size={22} color="#FFF" />}
          labelStyle={styles.drawerLabelStyle}
          onPress={() => dispatch(logoutUser())}
        />
      </DrawerContentScrollView>
    </LinearGradient>
  );
}

type Props = {
  categorySlug: string;
};

export default function CategoryPartnerDrawer({ categorySlug }: Props) {
  const { t, languageCode } = useTranslation();
  const { languageCode: lang } = useLanguage();
  const user = useSelector(selectUser);
  const slug = getPartnerCategorySlug(user) || categorySlug;
  const [category, setCategory] = useState<BusinessCategory | null>(null);

  useEffect(() => {
    fetchBusinessCategories(lang || languageCode, 'mobile')
      .then((items) => setCategory(items.find((c) => c.slug === slug) || null))
      .catch(() => setCategory(null));
  }, [slug, lang, languageCode]);

  const categoryName = category?.name || slug;
  const categoryColor = category?.color || '#0171CE';

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: categoryColor },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        drawerActiveTintColor: '#FFF',
        drawerInactiveTintColor: 'rgba(255,255,255,0.85)',
        drawerActiveBackgroundColor: 'rgba(255,255,255,0.15)',
      }}
    >
      <Drawer.Screen
        name="CategoryDashboard"
        options={{
          drawerLabel: t('drawerDashboard'),
          title: categoryName,
          drawerIcon: ({ size }) => (
            <Ionicons name="grid-outline" size={size} color="#FFF" />
          ),
        }}
      >
        {() => (
          <CategoryPartnerDashboard
            categorySlug={slug}
            categoryName={categoryName}
            categoryColor={categoryColor}
            featureKeys={category?.feature_keys}
          />
        )}
      </Drawer.Screen>
      <Drawer.Screen
        name="CategoryProfile"
        component={Profile}
        options={{
          drawerLabel: t('drawerProfile'),
          title: t('drawerProfile'),
          drawerIcon: ({ size }) => (
            <Ionicons name="person-outline" size={size} color="#FFF" />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContent: { flex: 1 },
  drawerHeader: {
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  drawerBrand: { color: '#fff', fontSize: 20, fontWeight: '800' },
  drawerLabelStyle: { color: '#FFF', fontWeight: '600' },
});
