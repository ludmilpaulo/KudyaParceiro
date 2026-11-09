import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  createFoodAddon,
  createFoodAddonGroup,
  deleteFoodAddon,
  deleteFoodAddonGroup,
  fetchFoodPartnerProducts,
  updateFoodAddon,
  updateFoodAddonGroup,
} from '../../features/food/api/foodPartnerApi';
import type { FoodAddon, FoodAddonGroup } from '../../features/food/api/foodTypes';
import { extractApiErrorDetail, parseAddonPrice, parseSelectBounds } from '../../features/food/foodHelpers';
import { useFoodTranslation } from '../../hooks/useFoodTranslation';
import FoodPromptModal from './FoodPromptModal';

type Props = {
  productId: number | null;
  productName: string;
  onClose: () => void;
};

type GroupForm = {
  groupId: number | null;
  name: string;
  required: boolean;
  min: string;
  max: string;
};

type AddonForm = {
  groupId: number;
  addonId: number | null;
  name: string;
  price: string;
  isActive: boolean;
};

type PendingDelete = { kind: 'group'; id: number } | { kind: 'addon'; id: number };

export default function FoodAddonGroupsModal({ productId, productName, onClose }: Props) {
  const { ft } = useFoodTranslation();
  const [groups, setGroups] = useState<FoodAddonGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [groupForm, setGroupForm] = useState<GroupForm | null>(null);
  const [addonForm, setAddonForm] = useState<AddonForm | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  const load = useCallback(async () => {
    if (productId == null) return;
    setLoading(true);
    setLoadError(null);
    try {
      const products = await fetchFoodPartnerProducts();
      const product = products.find((item) => item.id === productId);
      setGroups(product?.addon_groups ?? []);
    } catch (error) {
      setLoadError(extractApiErrorDetail(error, ft('foodAddonsLoadFailed')));
    } finally {
      setLoading(false);
    }
  }, [productId, ft]);

  useEffect(() => {
    setGroups([]);
    setGroupForm(null);
    setAddonForm(null);
    setFormError(null);
    void load();
  }, [load]);

  const run = async (task: () => Promise<unknown>, after?: () => void) => {
    setSaving(true);
    setFormError(null);
    try {
      await task();
      after?.();
      await load();
    } catch (error) {
      setFormError(extractApiErrorDetail(error, ft('foodActionFailed')));
    } finally {
      setSaving(false);
    }
  };

  const saveGroup = () => {
    if (!groupForm || productId == null) return;
    const name = groupForm.name.trim();
    if (!name) {
      setFormError(ft('foodNameRequired'));
      return;
    }
    const bounds = parseSelectBounds(groupForm.min, groupForm.max);
    if (!bounds.ok) {
      setFormError(ft('foodMinMaxInvalid'));
      return;
    }
    const payload = { name, required: groupForm.required, min_select: bounds.min, max_select: bounds.max };
    const { groupId } = groupForm;
    void run(
      () => (groupId == null ? createFoodAddonGroup({ ...payload, product: productId }) : updateFoodAddonGroup(groupId, payload)),
      () => setGroupForm(null),
    );
  };

  const saveAddon = () => {
    if (!addonForm) return;
    const name = addonForm.name.trim();
    if (!name) {
      setFormError(ft('foodNameRequired'));
      return;
    }
    const price = parseAddonPrice(addonForm.price);
    if (price === null) {
      setFormError(ft('foodPriceInvalid'));
      return;
    }
    const payload = { name, price, is_active: addonForm.isActive };
    const { addonId, groupId } = addonForm;
    void run(
      () => (addonId == null ? createFoodAddon({ ...payload, group: groupId }) : updateFoodAddon(addonId, payload)),
      () => setAddonForm(null),
    );
  };

  const toggleAddon = (addon: FoodAddon, value: boolean) => {
    void run(() => updateFoodAddon(addon.id, { is_active: value }));
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const target = pendingDelete;
    void run(
      () => (target.kind === 'group' ? deleteFoodAddonGroup(target.id) : deleteFoodAddon(target.id)),
      () => setPendingDelete(null),
    );
  };

  const renderGroupForm = () =>
    groupForm ? (
      <View style={styles.form}>
        <Text style={styles.label}>{ft('foodGroupName')}</Text>
        <TextInput
          value={groupForm.name}
          onChangeText={(name) => setGroupForm({ ...groupForm, name })}
          style={styles.input}
          maxLength={120}
        />
        <View style={styles.inlineRow}>
          <Text style={styles.label}>{ft('foodGroupRequired')}</Text>
          <Switch value={groupForm.required} onValueChange={(required) => setGroupForm({ ...groupForm, required })} />
        </View>
        <View style={styles.inlineRow}>
          <View style={styles.half}>
            <Text style={styles.label}>{ft('foodMinSelect')}</Text>
            <TextInput
              value={groupForm.min}
              onChangeText={(min) => setGroupForm({ ...groupForm, min: min.replace(/\D/g, '') })}
              keyboardType="number-pad"
              maxLength={2}
              style={styles.input}
            />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>{ft('foodMaxSelect')}</Text>
            <TextInput
              value={groupForm.max}
              onChangeText={(max) => setGroupForm({ ...groupForm, max: max.replace(/\D/g, '') })}
              keyboardType="number-pad"
              maxLength={2}
              style={styles.input}
            />
          </View>
        </View>
        <FormButtons
          saving={saving}
          saveLabel={saving ? ft('foodSaving') : ft('foodSave')}
          cancelLabel={ft('foodCancel')}
          onSave={saveGroup}
          onCancel={() => {
            setGroupForm(null);
            setFormError(null);
          }}
        />
      </View>
    ) : null;

  const renderAddonForm = (groupId: number) =>
    addonForm && addonForm.groupId === groupId ? (
      <View style={styles.form}>
        <Text style={styles.label}>{ft('foodAddonName')}</Text>
        <TextInput
          value={addonForm.name}
          onChangeText={(name) => setAddonForm({ ...addonForm, name })}
          style={styles.input}
          maxLength={120}
        />
        <Text style={styles.label}>{ft('foodAddonPrice')}</Text>
        <TextInput
          value={addonForm.price}
          onChangeText={(price) => setAddonForm({ ...addonForm, price })}
          keyboardType="decimal-pad"
          style={styles.input}
        />
        <View style={styles.inlineRow}>
          <Text style={styles.label}>{ft('foodAddonActive')}</Text>
          <Switch value={addonForm.isActive} onValueChange={(isActive) => setAddonForm({ ...addonForm, isActive })} />
        </View>
        <FormButtons
          saving={saving}
          saveLabel={saving ? ft('foodSaving') : ft('foodSave')}
          cancelLabel={ft('foodCancel')}
          onSave={saveAddon}
          onCancel={() => {
            setAddonForm(null);
            setFormError(null);
          }}
        />
      </View>
    ) : null;

  return (
    <Modal visible={productId != null} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {ft('foodAddonGroupsFor', { product: productName })}
          </Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>{ft('foodClose')}</Text>
          </Pressable>
        </View>

        {loading && groups.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#0171CE" />
          </View>
        ) : loadError ? (
          <View style={styles.center}>
            <Text style={styles.error}>{loadError}</Text>
            <Pressable onPress={() => void load()} style={styles.primaryButton}>
              <Text style={styles.primaryText}>{ft('foodRetry')}</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            {formError && !pendingDelete ? <Text style={styles.error}>{formError}</Text> : null}
            {groups.length === 0 && !groupForm ? <Text style={styles.muted}>{ft('foodAddonsEmpty')}</Text> : null}

            {groups.map((group) => (
              <View key={group.id} style={styles.group}>
                {groupForm?.groupId === group.id ? (
                  renderGroupForm()
                ) : (
                  <View style={styles.groupHeader}>
                    <View style={styles.flex}>
                      <Text style={styles.groupName}>{group.name}</Text>
                      <Text style={styles.groupMeta}>
                        {group.required ? `${ft('foodGroupRequired')} · ` : ''}
                        {ft('foodSelectRange', { min: group.min_select, max: group.max_select })}
                      </Text>
                    </View>
                    <Pressable
                      disabled={saving}
                      onPress={() => {
                        setAddonForm(null);
                        setFormError(null);
                        setGroupForm({
                          groupId: group.id,
                          name: group.name,
                          required: group.required,
                          min: String(group.min_select),
                          max: String(group.max_select),
                        });
                      }}
                      style={styles.linkButton}
                    >
                      <Text style={styles.link}>{ft('foodEdit')}</Text>
                    </Pressable>
                    <Pressable
                      disabled={saving}
                      onPress={() => setPendingDelete({ kind: 'group', id: group.id })}
                      style={styles.linkButton}
                    >
                      <Text style={styles.dangerLink}>{ft('foodDelete')}</Text>
                    </Pressable>
                  </View>
                )}

                {group.addons.length === 0 ? <Text style={styles.muted}>{ft('foodGroupNoAddons')}</Text> : null}
                {group.addons.map((addon) =>
                  addonForm?.addonId === addon.id ? (
                    <View key={addon.id}>{renderAddonForm(group.id)}</View>
                  ) : (
                    <View key={addon.id} style={styles.addonRow}>
                      <View style={styles.flex}>
                        <Text style={[styles.addonName, !addon.is_active && styles.inactive]}>{addon.name}</Text>
                        <Text style={styles.groupMeta}>
                          {addon.price} · {addon.is_active ? ft('foodAddonActive') : ft('foodAddonInactive')}
                        </Text>
                      </View>
                      <Switch
                        value={addon.is_active}
                        disabled={saving}
                        onValueChange={(value) => toggleAddon(addon, value)}
                      />
                      <Pressable
                        disabled={saving}
                        onPress={() => {
                          setGroupForm(null);
                          setFormError(null);
                          setAddonForm({
                            groupId: group.id,
                            addonId: addon.id,
                            name: addon.name,
                            price: addon.price,
                            isActive: addon.is_active,
                          });
                        }}
                        style={styles.linkButton}
                      >
                        <Text style={styles.link}>{ft('foodEdit')}</Text>
                      </Pressable>
                      <Pressable
                        disabled={saving}
                        onPress={() => setPendingDelete({ kind: 'addon', id: addon.id })}
                        style={styles.linkButton}
                      >
                        <Text style={styles.dangerLink}>{ft('foodDelete')}</Text>
                      </Pressable>
                    </View>
                  ),
                )}
                {addonForm?.groupId === group.id && addonForm.addonId == null ? renderAddonForm(group.id) : null}
                {addonForm?.groupId !== group.id ? (
                  <Pressable
                    disabled={saving}
                    onPress={() => {
                      setGroupForm(null);
                      setFormError(null);
                      setAddonForm({ groupId: group.id, addonId: null, name: '', price: '', isActive: true });
                    }}
                    style={styles.addButton}
                  >
                    <Text style={styles.link}>+ {ft('foodAddAddon')}</Text>
                  </Pressable>
                ) : null}
              </View>
            ))}

            {groupForm?.groupId === null ? (
              <View style={styles.group}>{renderGroupForm()}</View>
            ) : (
              <Pressable
                disabled={saving}
                onPress={() => {
                  setAddonForm(null);
                  setFormError(null);
                  setGroupForm({ groupId: null, name: '', required: false, min: '0', max: '1' });
                }}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryText}>+ {ft('foodAddGroup')}</Text>
              </Pressable>
            )}
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      <FoodPromptModal
        visible={pendingDelete != null}
        title={ft('foodDelete')}
        message={pendingDelete?.kind === 'group' ? ft('foodDeleteGroupConfirm') : ft('foodDeleteAddonConfirm')}
        confirmLabel={ft('foodDelete')}
        cancelLabel={ft('foodCancel')}
        destructive
        busy={saving}
        serverError={pendingDelete ? formError : null}
        onConfirm={confirmDelete}
        onCancel={() => {
          setPendingDelete(null);
          setFormError(null);
        }}
      />
    </Modal>
  );
}

function FormButtons({
  saving,
  saveLabel,
  cancelLabel,
  onSave,
  onCancel,
}: {
  saving: boolean;
  saveLabel: string;
  cancelLabel: string;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <View style={styles.formButtons}>
      <Pressable onPress={onCancel} disabled={saving} style={[styles.smallButton, styles.secondary]}>
        <Text style={styles.secondaryText}>{cancelLabel}</Text>
      </Pressable>
      <Pressable onPress={onSave} disabled={saving} style={[styles.smallButton, styles.primary]}>
        <Text style={styles.primaryText}>{saveLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: '#0171CE',
  },
  headerTitle: { flex: 1, color: '#fff', fontSize: 17, fontWeight: '800' },
  closeButton: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8 },
  closeText: { color: '#fff', fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  body: { padding: 16, paddingBottom: 48 },
  flex: { flex: 1 },
  group: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  groupHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  groupName: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  groupMeta: { fontSize: 12, color: '#64748b', marginTop: 2 },
  addonRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  addonName: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  inactive: { color: '#94a3b8', textDecorationLine: 'line-through' },
  linkButton: { paddingHorizontal: 8, paddingVertical: 4 },
  link: { color: '#0171CE', fontWeight: '700' },
  dangerLink: { color: '#dc2626', fontWeight: '700' },
  addButton: { marginTop: 8, paddingVertical: 6 },
  form: { backgroundColor: '#f1f5f9', borderRadius: 10, padding: 10, marginVertical: 6 },
  label: { fontSize: 13, fontWeight: '700', color: '#334155', marginTop: 6, marginBottom: 4 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, color: '#0f172a' },
  inlineRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  half: { width: '48%' },
  formButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  smallButton: { borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, marginLeft: 8 },
  primary: { backgroundColor: '#0171CE' },
  secondary: { backgroundColor: '#e2e8f0' },
  primaryButton: { marginTop: 8, backgroundColor: '#0171CE', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '700' },
  secondaryText: { color: '#0f172a', fontWeight: '700' },
  muted: { color: '#64748b', fontStyle: 'italic', marginVertical: 4 },
  error: { color: '#b91c1c', marginBottom: 8, textAlign: 'center' },
});
