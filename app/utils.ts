import { useMatches } from '@remix-run/react';
import { useMemo } from 'react';

import type { User } from '~/models/user.server';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import type { UploadHandler } from '@remix-run/node';
import {
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
} from '@remix-run/server-runtime';
import { uploadImage } from '~/cloudinary.server';

dayjs.extend(utc);
dayjs.extend(timezone);

const DEFAULT_REDIRECT = '/';

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT
) {
  if (!to || typeof to !== 'string') {
    return defaultRedirect;
  }

  if (!to.startsWith('/') || to.startsWith('//')) {
    return defaultRedirect;
  }

  return to;
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(id: string): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(() => matchingRoutes.find((route) => route.id === id), [matchingRoutes, id]);
  return route?.data;
}

function isUser(user: any): user is User {
  return user && typeof user === 'object' && typeof user.email === 'string';
}

export function useOptionalUser(): User | undefined {
  const data = useMatchesData('root');
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user;
}

export function useUser(): User {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      'No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead.'
    );
  }
  return maybeUser;
}

export function validateEmail(email: unknown): email is string {
  return typeof email === 'string' && email.length > 3 && email.includes('@');
}

export function validateName(name: unknown): name is string {
  return typeof name === 'string' && name.length > 3;
}

export function formDataFromObject(object: Record<string, any>): FormData {
  const formData = new FormData();

  Object.entries(object).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, value);
    }
  });

  return formData;
}

export function payloadIsObject(payload: unknown): payload is Record<string, string | number> {
  return typeof payload === 'object' && payload !== null;
}

export function getInstagramUrl(username: string): string {
  return `https://instagram.com/${username}`;
}

export function parseInstagramHandleFromUrl(url: string): string | null {
  const match = url.match(/^https?:\/\/instagram\.com\/([^/]+)$/);
  return match ? match[1] : null;
}

export function validatePassword(password: unknown): password is string {
  return typeof password === 'string' && password.length >= 8;
}

export function parseDateFromTimezone({ date, timezone }: { date: string; timezone: string }): Date {
  return dayjs.tz(date, timezone).toDate();
}

export function createFileUploadHandler(inputName: string, folderName: string): UploadHandler {
  return composeUploadHandlers(async ({ name, data, filename }) => {
    if (name !== inputName) {
      return undefined;
    }

    if (!filename) {
      return '';
    }

    const uploadedImage = await uploadImage(data, folderName);
    return uploadedImage?.public_id;
  }, createMemoryUploadHandler());
}
