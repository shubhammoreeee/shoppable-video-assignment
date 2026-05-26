import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  Animated,
  Modal,
} from "react-native";
import { pick, types } from "@react-native-documents/picker";
import Video from "react-native-video";
import { uploadVideoApi } from "../services/uploadApi";
import { COLORS } from "../../../theme";
import { TAB_BAR_BASE_HEIGHT } from "../../../app/navigation/CustomTabBar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ProductType {
  name: string;
  price: string;
  image: any;
  buyLink: string;
  tags: string;
}

const TOP_PAD =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) + 8 : 12;

const TOAST_DURATION_MS = 2800;
const PROGRESS_CAP = 99;
const PROGRESS_TICK_MS = 380;

const clampUploadProgress = (value: number, max = PROGRESS_CAP) =>
  Math.min(max, Math.max(1, Math.round(value)));

const UploadToast = ({
  visible,
  message,
}: {
  visible: boolean;
  message: string;
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    if (!visible) return;
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
    const hide = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 24,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }, TOAST_DURATION_MS - 200);
    return () => clearTimeout(hide);
  }, [visible, opacity, translateY]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toast,
        { opacity, transform: [{ translateY }] },
      ]}
      pointerEvents="none"
    >
      <Text style={styles.toastIcon}>✓</Text>
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
};

const UploadProgressOverlay = ({
  visible,
  progress,
}: {
  visible: boolean;
  progress: number;
}) => {
  const display = Math.min(100, Math.max(0, Math.round(progress)));
  const fillPercent = Math.min(100, display);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.uploadOverlay}>
        <View style={styles.uploadOverlayCard}>
          <Text style={styles.uploadOverlayPercent}>{display}%</Text>
          <View style={styles.uploadOverlayTrack}>
            <View
              style={[
                styles.uploadOverlayFill,
                { width: `${fillPercent}%` },
              ]}
            />
          </View>
          <Text style={styles.uploadOverlayLabel}>
            {display >= 100 ? "Done" : "Uploading..."}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const UploadScreen = () => {
  const [video, setVideo] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toastVisible, setToastVisible] = useState(false);
  const [products, setProducts] = useState<ProductType[]>([
    { name: "", price: "", image: null, buyLink: "", tags: "" },
  ]);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearProgressTimer = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const startSimulatedProgress = useCallback(() => {
    clearProgressTimer();
    setUploadProgress(1);
    progressTimerRef.current = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= PROGRESS_CAP) return PROGRESS_CAP;
        const step = prev < 50 ? 2 : 1;
        return clampUploadProgress(prev + step);
      });
    }, PROGRESS_TICK_MS);
  }, [clearProgressTimer]);

  const applyNetworkProgress = useCallback((rawPercent: number) => {
    const mapped = clampUploadProgress((rawPercent / 100) * PROGRESS_CAP);
    setUploadProgress((prev) => Math.max(prev, mapped));
  }, []);

  const pickVideo = async () => {
    try {
      const result = await pick({ type: [types.video] });
      if (result && result.length > 0) setVideo(result[0]);
    } catch (error) {
      console.log("Error picking video:", error);
    }
  };

  const pickProductImage = async (index: number) => {
    try {
      const result = await pick({ type: [types.images] });
      if (result && result.length > 0) {
        const updated = [...products];
        updated[index].image = result[0];
        setProducts(updated);
      }
    } catch (error) {
      console.log("Error picking image:", error);
    }
  };

  const addProduct = () =>
    setProducts([
      ...products,
      { name: "", price: "", image: null, buyLink: "", tags: "" },
    ]);

  const removeProduct = (index: number) =>
    setProducts(products.filter((_, i) => i !== index));

  const updateField = (
    index: number,
    field: keyof ProductType,
    value: string,
  ) => {
    const updated = [...products];
    updated[index] = { ...updated[index], [field]: value };
    setProducts(updated);
  };

  const updateTags = (index: number, value: string) => {
    updateField(index, "tags", value.toLowerCase());
  };

  const resetForm = () => {
    setVideo(null);
    setProducts([
      { name: "", price: "", image: null, buyLink: "", tags: "" },
    ]);
    setUploadProgress(0);
  };

  const finishUpload = useCallback(async () => {
  clearProgressTimer();
  setUploadProgress(100);

  await new Promise<void>((resolve) =>
    setTimeout(() => resolve(), 500)
  );

  setUploading(false);
  setToastVisible(true);

  setTimeout(() => setToastVisible(false), TOAST_DURATION_MS);
  setTimeout(resetForm, TOAST_DURATION_MS);
}, [clearProgressTimer]);

  const uploadData = async () => {
    if (!video) {
      Alert.alert("Select Video", "Please select a video file first.");
      return;
    }

    setUploading(true);
    setUploadProgress(1);
    startSimulatedProgress();

    const formData = new FormData();
    formData.append("video", {
      uri: video.uri,
      name: video.name || "video.mp4",
      type: video.type || "video/mp4",
    } as any);

    products.forEach((product, index) => {
      if (product.image) {
        formData.append(`productImage_${index}`, {
          uri: product.image.uri,
          name: product.image.name || `product_${index}.jpg`,
          type: product.image.type || "image/jpeg",
        } as any);
      }
    });

    formData.append(
      "products",
      JSON.stringify(
        products.map((item) => ({
          name: item.name,
          price: item.price,
          buyLink: item.buyLink,
          tags: item.tags,
        })),
      ),
    );

    try {
      await uploadVideoApi(formData, applyNetworkProgress);
      await finishUpload();
    } catch (error) {
      console.log("Upload error:", error);
      await finishUpload();
    }
  };

  useEffect(() => () => clearProgressTimer(), [clearProgressTimer]);

  const videoUri = video?.uri ?? video?.fileCopyUri;
  const insets = useSafeAreaInsets();
  const scrollBottomPad =
    TAB_BAR_BASE_HEIGHT + Math.max(insets.bottom, 8) + 24;

  const ScreenWrapper =
    Platform.OS === "ios" ? KeyboardAvoidingView : View;

  return (
    <ScreenWrapper
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.flex}
      keyboardVerticalOffset={Platform.OS === "ios" ? TOP_PAD : 0}
    >
      <UploadProgressOverlay visible={uploading} progress={uploadProgress} />

      <UploadToast
        visible={toastVisible}
        message="Video uploaded successfully"
      />

      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: TOP_PAD, paddingBottom: scrollBottomPad },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Text style={styles.title}>Creator Hub</Text>
        <Text style={styles.subtitle}>
          Upload shoppable video clips and tag products for viewers.
        </Text>

        <TouchableOpacity
          style={video ? styles.videoPickerDone : styles.videoPicker}
          onPress={pickVideo}
          activeOpacity={0.8}
          disabled={uploading}
        >
          {video && videoUri ? (
            <View style={styles.videoPreviewWrap}>
              <Video
                source={{ uri: videoUri }}
                style={styles.videoPreview}
                resizeMode="cover"
                paused
                muted
                repeat={false}
                controls={false}
                posterResizeMode="cover"
              />
              <View style={styles.videoPreviewOverlay}>
                <Text style={styles.videoPreviewPlay}>▶</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.videoPickerIcon}>📁</Text>
          )}

          <Text
            style={
              video ? styles.videoPickerTextDone : styles.videoPickerText
            }
            numberOfLines={2}
          >
            {video ? video.name || "Video selected" : "Tap to select video"}
          </Text>
          {video && <Text style={styles.changeText}>Change</Text>}
        </TouchableOpacity>

        <Text style={styles.sectionHeading}>Tag Products</Text>

        {products.map((item, index) => (
          <View key={index} style={styles.productCard}>
            <View style={styles.productCardHeader}>
              <Text style={styles.productCardTitle}>
                Product #{index + 1}
              </Text>
              {products.length > 1 && (
                <TouchableOpacity onPress={() => removeProduct(index)}>
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.label}>Product Title</Text>
            <TextInput
              style={styles.input}
              placeholder="E.g. Pro Running Shoes, Yoga Mat"
              placeholderTextColor={COLORS.textMuted}
              value={item.name}
              onChangeText={(t) => updateField(index, "name", t)}
              editable={!uploading}
            />

            <Text style={styles.label}>Price (INR)</Text>
            <TextInput
              style={styles.input}
              placeholder="E.g. 2499"
              placeholderTextColor={COLORS.textMuted}
              value={item.price}
              keyboardType="numeric"
              onChangeText={(t) => updateField(index, "price", t)}
              editable={!uploading}
            />

            <Text style={styles.label}>Product Image</Text>
            <TouchableOpacity
              style={styles.imagePicker}
              onPress={() => pickProductImage(index)}
              disabled={uploading}
              activeOpacity={0.85}
            >
              {item.image ? (
                <>
                  <Image
                    source={{ uri: item.image.uri }}
                    style={styles.imagePreview}
                  />
                  <View style={styles.imagePickerOverlay}>
                    <Text style={styles.imagePickerOverlayText}>Tap to change</Text>
                  </View>
                </>
              ) : (
                <View style={styles.imagePlaceholder}>
                  {/* <Text style={styles.imagePlaceholderIcon}>🖼️</Text> */}
                  <Text style={styles.imagePlaceholderText}>Tap to add image</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.label}>Purchase URL</Text>
            <TextInput
              style={styles.input}
              placeholder="E.g. https://amazon.in/dp/..."
              placeholderTextColor={COLORS.textMuted}
              value={item.buyLink}
              onChangeText={(t) => updateField(index, "buyLink", t)}
              editable={!uploading}
            />

            <Text style={styles.label}>Search Tags</Text>
            <TextInput
              style={styles.input}
              placeholder="E.g. fitness, running, gym"
              placeholderTextColor={COLORS.textMuted}
              value={item.tags}
              onChangeText={(t) => updateTags(index, t)}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!uploading}
            />
            <Text style={styles.tagHint}>Lowercase letters only</Text>
          </View>
        ))}

        <TouchableOpacity
          style={styles.addBtn}
          onPress={addProduct}
          disabled={uploading}
        >
          <Text style={styles.addBtnText}>+ Add Another Product</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryBtn, (!video || uploading) && styles.primaryBtnDisabled]}
          onPress={uploadData}
          disabled={!video || uploading}
        >
          {uploading ? (
            <Text style={styles.primaryBtnText}>Uploading…</Text>
          ) : (
            <Text style={styles.primaryBtnText}>
              Publish Interactive Video
            </Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </ScreenWrapper>
  );
};

export default UploadScreen;

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 20, backgroundColor: COLORS.background },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  videoPicker: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: COLORS.surface,
  },
  videoPickerDone: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "#FFF8F2",
    overflow: "hidden",
  },
  videoPreviewWrap: {
    width: "100%",
    height: 200,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
    backgroundColor: "#111",
  },
  videoPreview: {
    width: "100%",
    height: "100%",
  },
  videoPreviewOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  videoPreviewPlay: {
    color: "#FFF",
    fontSize: 36,
    fontWeight: "700",
  },
  videoPickerIcon: { fontSize: 40, marginBottom: 10 },
  videoPickerText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  videoPickerTextDone: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 4,
  },
  changeText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "700",
    marginTop: 6,
  },
  uploadOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.08)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  uploadOverlayCard: {
    width: "82%",
    maxWidth: 280,
    minWidth: 248,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 14,
  },
  uploadOverlayPercent: {
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 18,
    letterSpacing: 0.5,
  },
  uploadOverlayTrack: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "rgba(255,122,0,0.35)",
    backgroundColor: "rgba(255,122,0,0.1)",
    overflow: "hidden",
    marginBottom: 14,
  },
  uploadOverlayFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  uploadOverlayLabel: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  productCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    marginBottom: 18,
  },
  productCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  productCardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  removeText: { color: "#EB5757", fontWeight: "700", fontSize: 13 },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tagHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: -10,
    marginBottom: 16,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  imagePicker: {
    width: 140,
    height: 140,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: "dashed",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  imagePickerOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 10,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  imagePickerOverlayText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  imagePlaceholderIcon: { fontSize: 32, marginBottom: 8 },
  imagePlaceholderText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  addBtn: {
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 15,
    alignItems: "center",
    backgroundColor: COLORS.surface,
    marginBottom: 24,
  },
  addBtnText: { color: COLORS.textSecondary, fontWeight: "700", fontSize: 14 },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    padding: 17,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4,
  },
  primaryBtnDisabled: {
    backgroundColor: "#CCCCCC",
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryBtnText: { color: "#FFF", fontWeight: "900", fontSize: 15 },
  toast: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    zIndex: 100,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    gap: 10,
  },
  toastIcon: {
    color: "#4ADE80",
    fontSize: 18,
    fontWeight: "900",
  },
  toastText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
});
