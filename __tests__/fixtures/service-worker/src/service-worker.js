import { precacheAndRoute } from 'workbox-precaching/precacheAndRoute';
import { skipWaiting } from 'workbox-core/skipWaiting';
import { setCacheNameDetails } from 'workbox-core/setCacheNameDetails';

setCacheNameDetails({ prefix: 'inject_manifest' });
skipWaiting();
precacheAndRoute(self.__WB_MANIFEST);
