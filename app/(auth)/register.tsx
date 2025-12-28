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
import { register } from "@/services/auth";
import { colors } from "@/utils/theme";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    if (!username.trim()) {
      setError("Username is required");
      return false;
    }
    if (username.includes(" ")) {
      setError("Username cannot contain spaces");
      return false;
    }
    if (username.length < 3) {
      setError("Username must be at least 3 characters long");
      return false;
    }
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (email.includes(" ")) {
      setError("Email cannot contain spaces");
      return false;
    }
    const emailRegex = /^[^s@]+@[^s@]+.[^s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
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
    if (!confirmPassword.trim()) {
      setError("Please confirm your password");
      return false;
    }
    if (confirmPassword.includes(" ")) {
      setError("Confirm password cannot contain spaces");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await register({ username, email, password });
      if (response.status.toLocaleLowerCase() === "success") {
        router.replace("/login");
      } else {
        setError(response.message || "Registration failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during registration");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surface2,
    borderRadius: 12,
    padding: 16,
    color: colors.text,
    fontSize: 16,
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
              Create Account
            </Text>
            <Text style={{ color: colors.muted, fontSize: 15, textAlign: "center", marginBottom: 40 }}>
              Join VIMAYA and take control of your focus
            </Text>

            <View style={{ gap: 16 }}>
              {error ? (
                <View style={{ backgroundColor: colors.error + "20", padding: 12, borderRadius: 10 }}>
                  <Text style={{ color: colors.error, textAlign: "center" }}>{error}</Text>
                </View>
              ) : null}

              <TextInput
                style={inputStyle}
                placeholder="Username"
                placeholderTextColor={colors.muted}
                value={username}
                onChangeText={(text) => { setUsername(text); setError(""); }}
                autoCapitalize="none"
                returnKeyType="next"
              />

              <TextInput
                style={inputStyle}
                placeholder="Email"
                placeholderTextColor={colors.muted}
                value={email}
                onChangeText={(text) => { setEmail(text); setError(""); }}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />

              <TextInput
                style={inputStyle}
                placeholder="Password"
                placeholderTextColor={colors.muted}
                value={password}
                onChangeText={(text) => { setPassword(text); setError(""); }}
                secureTextEntry
                autoCapitalize="none"
                returnKeyType="next"
              />

              <TextInput
                style={inputStyle}
                placeholder="Confirm Password"
                placeholderTextColor={colors.muted}
                value={confirmPassword}
                onChangeText={(text) => { setConfirmPassword(text); setError(""); }}
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
                onPress={handleRegister}
                disabled={isSubmitting}
              >
                <Text style={{ color: colors.text, textAlign: "center", fontWeight: "600", fontSize: 16 }}>
                  {isSubmitting ? "Creating account..." : "Create Account"}
                </Text>
              </TouchableOpacity>

              <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 16 }}>
                <Text style={{ color: colors.muted }}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/login")}>
                  <Text style={{ color: colors.cool, fontWeight: "600" }}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
