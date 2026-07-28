import React, { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

type AccountType = 'client' | 'artisan' | 'company';
type AuthIntent = 'login' | 'signup';

type Props = {
  intent: AuthIntent;
  accountType: AccountType;
  countryId?: number;
  countryIso2?: string;
  timezoneName?: string;
  onAuthenticated: (account: unknown) => void;
};

const API_URL = 'https://api-v2.hustleapp.info/api/v1/auth/apple';

export function HustleAppleSignInButton({
  intent,
  accountType,
  countryId,
  countryIso2 = 'GH',
  timezoneName = 'Africa/Accra',
  onAuthenticated,
}: Props) {
  const [available, setAvailable] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    AppleAuthentication.isAvailableAsync().then(setAvailable).catch(() => setAvailable(false));
  }, []);

  if (!available) return null;

  const signIn = async () => {
    if (busy) return;
    setBusy(true);

    try {
      // A fresh nonce is required for every Apple authorization attempt.
      const nonce = Crypto.randomUUID();
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce,
      });

      if (!credential.authorizationCode) {
        throw new Error('Apple did not return an authorization code.');
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          authorization_code: credential.authorizationCode,
          identity_token: credential.identityToken,
          nonce,
          platform: 'ios',
          intent,
          account_type: accountType,
          country_id: countryId,
          country_iso2: countryIso2,
          timezone_name: timezoneName,
          first_name: credential.fullName?.givenName ?? undefined,
          last_name: credential.fullName?.familyName ?? undefined,
        }),
      });

      const payload = await response.json();
      if (!response.ok || payload?.success !== true) {
        const code = payload?.data?.errors?.code ?? payload?.errors?.code;
        throw new Error(code || payload?.message || 'Apple sign-in failed.');
      }

      const accessToken = payload?.data?.access_token;
      if (typeof accessToken !== 'string' || accessToken.length === 0) {
        throw new Error('The API did not return a HustleApp access token.');
      }

      // Store only HustleApp's JWT as the application session token.
      await SecureStore.setItemAsync('hustle_access_token', accessToken);
      onAuthenticated(payload.data.account);
    } catch (error: any) {
      if (error?.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Apple sign-in', error?.message || 'Unable to sign in with Apple.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={8}
        style={styles.button}
        onPress={signIn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%' },
  button: { width: '100%', height: 48 },
});
