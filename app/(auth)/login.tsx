import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { login } from "@/services/auth";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/utils/theme";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();

  const validateForm = () => {
    if (!username.trim()) {
      setError("Username is required");
      return false;
    }
    if (username.includes(" ")) {
      setError("Username cannot contain spaces");
      return false;
    }
    if (!password.trim()) {
      setError("Password is required");
      return false;
    }
    if (password.includes(" ")) {
      setError("Password cannot contain spaces");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await login({ username, password });

      if (response.token) {
        await signIn(response.token);
        router.replace("/");
      } else {
        setError("Login failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during login");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 120 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
        >
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Text style={{ color: colors.text, fontSize: 28, fontWeight: "700", textAlign: "center", marginBottom: 8 }}>
              Welcome back
            </Text>
            <Text style={{ color: colors.muted, fontSize: 15, textAlign: "center", marginBottom: 40 }}>
              Sign in to continue to VIMAYA
            </Text>

            <View style={{ gap: 16 }}>
              {error ? (
                <View style={{ backgroundColor: colors.error + "20", padding: 12, borderRadius: 10 }}>
                  <Text style={{ color: colors.error, textAlign: "center" }}>{error}</Text>
                </View>
              ) : null}

              <TextInput
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.surface2,
                  borderRadius: 12,
                  padding: 16,
                  color: colors.text,
                  fontSize: 16,
                }}
                placeholder="Username"
                placeholderTextColor={colors.muted}
                value={username}
                onChangeText={(text) => { setUsername(text); setError(""); }}
                autoCapitalize="none"
                returnKeyType="next"
              />

              <TextInput
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.surface2,
                  borderRadius: 12,
                  padding: 16,
                  color: colors.text,
                  fontSize: 16,
                }}
                placeholder="Password"
                placeholderTextColor={colors.muted}
                value={password}
                onChangeText={(text) => { setPassword(text); setError(""); }}
                secureTextEntry
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />

              <TouchableOpacity
                style={{
                  backgroundColor: isSubmitting ? colors.surface2 : colors.warm,
                  padding: 16,
                  borderRadius: 12,
                  opacity: isSubmitting ? 0.7 : 1,
                }}
                onPress={handleLogin}
                disabled={isSubmitting}
              >
                <Text style={{ color: colors.text, textAlign: "center", fontWeight: "600", fontSize: 16 }}>
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </Text>
              </TouchableOpacity>

              <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 16 }}>
                <Text style={{ color: colors.muted }}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/register")}>
                  <Text style={{ color: colors.cool, fontWeight: "600" }}>Register</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
