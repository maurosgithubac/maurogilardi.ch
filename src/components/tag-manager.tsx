"use client";

import { useEffect, useSyncExternalStore } from "react";
import { CONSENT_KEY, GTM_ID, readConsent, subscribeConsent, type Consent } from "@/lib/consent";

/** Lädt den Google Tag Manager erst nach Einwilligung und meldet Widerruf an Consent Mode. */
export function TagManager() {
  const consent = useSyncExternalStore(subscribeConsent, readConsent, () => null as Consent | null);

  useEffect(() => {
    if (consent === null) return;
    const w = window as Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
    w.dataLayer = w.dataLayer || [];
    w.gtag = w.gtag || function gtag(...args: unknown[]) {
      w.dataLayer?.push(args);
    };
    w.gtag("consent", "update", {
      analytics_storage: consent,
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });

    if (consent !== "granted") return;
    if (document.getElementById("gtm-script")) return;

    w.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    const script = document.createElement("script");
    script.id = "gtm-script";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
    document.head.appendChild(script);
  }, [consent]);

  return null;
}

/**
 * Consent Mode v2 vor GTM: Standard „verweigert“, außer die Einwilligung ist schon gespeichert.
 * Nur so entscheidet GTM beim Start richtig und die GA4-Tags feuern bei späteren Besuchen.
 */
export const consentDefaultScript = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}var s=null;try{s=localStorage.getItem('${CONSENT_KEY}')}catch(e){}var a=s==='granted'?'granted':'denied';gtag('consent','default',{analytics_storage:a,ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});`;
